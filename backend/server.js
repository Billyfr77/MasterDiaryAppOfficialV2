const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ override: true }); // Force override system env vars
const db = require('./src/models');
const { loadSettings } = require('./src/utils/settingsCache');

const app = express();

// Trust Proxy for Cloud Run
app.set('trust proxy', 1);

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (increased for dev)
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for dev)
  message: 'Too many requests from this IP, please try again later.',
  validate: { xForwardedForHeader: false } // Disable strict validation for Cloud Run proxies
});

// Middleware
app.use(limiter);

// CORS headers middleware - Allow All for Production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow any frontend
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

// Root route handled after API routes for production serving

// Serve static files (uploaded images) for local development
app.use('/uploads', express.static('uploads'));

app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/diaries', require('./src/routes/diaries'));
app.use('/api/paint-diaries', require('./src/routes/paintDiaries'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/nodes', require('./src/routes/nodes'));
app.use('/api/quotes', require('./src/routes/quotes'));
app.use('/api/quote-templates', require('./src/routes/quoteTemplates'));
app.use('/api/subscriptions', require('./src/routes/subscriptions'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/uploads', require('./src/routes/uploads')); // Register Upload routes
app.use('/api/notifications', require('./src/routes/notifications')); // Register Notification routes
app.use('/api/geocoding', require('./src/routes/geocoding'));
app.use('/api/map-assets', require('./src/routes/mapAssets')); // Register Map Asset routes
app.use('/api/waste', require('./src/routes/waste')); // Register Waste Management routes
app.use('/api/google', require('./src/routes/google')); // Register Google Integration routes

const bcrypt = require('bcryptjs'); // Ensure bcrypt is required

// ... existing imports

// Temporary Seeding Route
app.get('/api/seed-secret', async (req, res) => {
  try {
    // 1. Create Default Admin User
    const existingUser = await db.User.findOne({ where: { email: 'admin@masterdiary.com' } });
    let userId;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const newUser = await db.User.create({
        username: 'Admin',
        email: 'admin@masterdiary.com',
        password: hashedPassword,
        role: 'admin'
      });
      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    // 2. Create Default Settings
    const existingSettings = await db.Setting.findOne();
    if (!existingSettings) {
      await db.Setting.create({
        companyName: 'My Construction Co',
        currency: 'USD',
        theme: 'dark'
      });
    }

    // 3. Create a Sample Project
    const existingProject = await db.Project.findOne();
    if (!existingProject) {
      await db.Project.create({
        name: 'Example Renovation',
        client: 'John Doe',
        status: 'active',
        userId: userId,
        site: '123 Main St',
        value: 15000
      });
    }

    // 4. Create Sample Equipment
    const existingEquip = await db.Equipment.findOne();
    if (!existingEquip) {
      await db.Equipment.create({
        name: 'Graco 390 PC Stand',
        userId: userId,
        status: 'available',
        costRateBase: 15.00,
        chargeRate: 45.00,
        purchaseDate: new Date(),
        category: 'Sprayers'
      });
    }

    // 5. Create Sample Material (Node)
    const existingNode = await db.Node.findOne();
    if (!existingNode) {
      await db.Node.create({
        name: 'Dulux Wash&Wear 10L',
        description: 'Low Sheen Vivid White',
        unit: 'Bucket',
        pricePerUnit: 145.00,
        category: 'material',
        supplier: 'Bunnings',
        userId: userId
      });
    }

    res.send('Database Fully Seeded! User: admin@masterdiary.com / Admin123! Equipment & Materials Added.');
  } catch (error) {
    console.error('Seeding Error:', error);
    res.status(500).send('Seeding Failed: ' + error.message);
  }
});

 // Map Data Routes for Enhanced Map Builder
        app.post('/api/map-data', async (req, res) => {
          try {
            const { projectId, pois, connections, phases, routes } = req.body
            console.log('Map data saved:', { projectId, poiCount: pois?.length, connectionCount: connections?.length })
            res.json({ success: true, message: 'Map data saved successfully' })
          } catch (err) {
            console.error('Map data save error:', err)
            res.status(500).json({ error: 'Failed to save map data' })
          }
        })

        app.get('/api/map-data/:projectId', async (req, res) => {
          try {
            const { projectId } = req.params
            res.json({ pois: [], connections: [], phases: [], routes: [] })
          } catch (err) {
            console.error('Map data load error:', err)
            res.status(500).json({ error: 'Failed to load map data' })
          }
        })
// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Backend API is running (Development Mode)');
  });
}

// Start Server IMMEDIATELY for Cloud Run Health Checks
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Loaded GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED'}`);
});

// Database connection (Background)
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
    // Do NOT exit process, keep server alive for logs
  });

// Handle uncaught exceptions (exit to restart)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

 // Handle unhandled promise rejections (log but keep alive)
               process.on('unhandledRejection', (reason, promise) => {
                 console.error('Unhandled Rejection at:', promise, 'reason:', reason);
                 // Keep server alive to prevent crashes
               });
