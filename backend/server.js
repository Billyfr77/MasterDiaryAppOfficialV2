const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });
const db = require('./src/models');
const { loadSettings } = require('./src/utils/settingsCache');

const app = express();

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (increased for dev)
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for dev)
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);

// CORS headers middleware - FIXED for multiple ports
app.use((req, res, next) => {
  // Allow multiple frontend ports for development
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Full error details:', err);
  console.error('Stack trace:', err.stack);

  const isDevelopment = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    message: 'Something went wrong!',
    error: isDevelopment ? err.message : 'Internal server error',
    stack: isDevelopment ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - User: ${req.user?.id || 'unauthenticated'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  pid: process.pid
}));

app.get('/', (req, res) => {
  res.send('Backend API is running');
});
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/diaries', require('./src/routes/diaries_fixed2'));
app.use('/api/paint-diaries', require('./src/routes/paintDiaries'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/nodes', require('./src/routes/nodes'));
app.use('/api/quotes', require('./src/routes/quotes'));
app.use('/api/auth', require('./src/routes/auth'));

// Database connection and sync, then start server
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return db.sequelize.sync(); // Sync models to database
  })
  .then(() => {
    console.log('Database synchronized.');
    return loadSettings(); // Load settings cache
  })
  .then(() => {
    console.log('Settings cache loaded.');
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server started with PID: ${process.pid}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if db fails
  });

// Handle uncaught exceptions (exit to restart)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections (exit to restart)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
