const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
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
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection and sync
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
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Routes
app.get('/', (req, res) => {
  const port = process.env.PORT || 5000;
  res.send(`Backend running on port ${port} with WebSocket support`);
});
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/diaries', require('./src/routes/diaries_fixed2'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/nodes', require('./src/routes/nodes'));
app.use('/api/quotes', require('./src/routes/quotes'));

// CREATE HTTP SERVER FIRST
const server = http.createServer(app);

// SETUP SOCKET.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// WEBSOCKET CONNECTION HANDLER
io.on('connection', (socket) => {
  console.log('Dashboard client connected:', socket.id);

  // Handle dashboard data updates
  socket.on('dashboard-data', (data) => {
    console.log('Dashboard data update received');
    // Broadcast to all other connected clients
    socket.broadcast.emit('data-update', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with WebSocket support`);
});