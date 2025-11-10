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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: true,  // Fixed: Allows request origin dynamically
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Routes
app.get('/', (req, res) => {
  const port = process.env.PORT || 5000;
  res.send(`Backend running on port ${port}`);
});
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/diaries', require('./src/routes/diaries_fixed2'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/nodes', require('./src/routes/nodes'));
app.use('/api/quotes', require('./src/routes/quotes'));

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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if db fails
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit - log and continue
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit
});