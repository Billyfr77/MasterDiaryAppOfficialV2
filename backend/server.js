const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { v4: uuidv4 } = require('uuid');
const { logAudit } = require('./src/services/auditService');

// Load root .env first (e.g., C:\Users\billy\.env)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
// Then load project root .env (e.g. MasterDiaryAppOfficialV2/.env)
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
// Then load local backend .env, allowing it to override all
require('dotenv').config({ path: path.resolve(__dirname, './.env'), override: true });

// Configure pg to parse integers (Postgres returns bigint as strings by default)
if (process.env.NODE_ENV === 'production') {
  try {
    const pg = require('pg');
    pg.defaults.parseInt8 = true;
  } catch (e) {
    console.warn('Failed to configure pg parser (pg module might not be loaded yet or needed)');
  }
}

const db = require('./src/models');
const { loadSettings } = require('./src/utils/settingsCache');

const app = express();

// --- HARDENING: REQUEST TRACEABILITY ---
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

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

// Security: Content Security Policy (CSP)
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://*.googleapis.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "blob:", "https://maps.gstatic.com", "https://*.googleapis.com", "https://*.googleusercontent.com", "https://*.ggpht.com", "https://img.youtube.com", "https://i.ytimg.com", "https://www.transparenttextures.com"],
      "connect-src": ["'self'", "ws:", "wss:", "https://maps.googleapis.com", "https://*.googleapis.com"],
      "frame-src": ["'self'", "https://js.stripe.com", "https://www.youtube.com", "https://youtube.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Google Maps
}));

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent Parameter Pollution
app.use(compression());

// CORS headers middleware - Robust for Cloud Run with Credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
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

// JSON Middleware with Raw Body capture for Stripe Webhooks
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/stripe/webhook')) {
      req.rawBody = buf.toString();
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/api/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: {
      database: 'down',
      ai_core: 'down',
      neural_mesh: 'nominal'
    }
  };

  try {
    await db.sequelize.authenticate();
    health.services.database = 'up';
  } catch (e) { health.services.database = 'down'; }

  health.services.ai_core = process.env.GROK_API_KEY ? 'up' : 'down';
  
  const status = Object.values(health.services).every(s => s === 'up') ? 200 : 207;
  res.status(status).json(health);
});

// --- HARDENING: GLOBAL ERROR HANDLER ---
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error][Req:${req.id}] ${err.stack}`);
  
  // Record fatal errors in Audit Log
  if (statusCode === 500) {
    try {
      logAudit(req.user?.id, 'SYSTEM_CRASH', 'Server', req.id, { 
        error: err.message, 
        path: req.originalUrl 
      });
    } catch (e) {}
  }

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Operational Failure' : err.message,
    requestId: req.id
  });
};

app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/jobs', require('./src/routes/jobs'));
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
app.use('/api/stripe', require('./src/routes/stripe')); // NEW: Stripe Routes
app.use('/api/auth', require('./src/routes/auth'));

app.use('/api/uploads', require('./src/routes/uploads')); // Register Upload routes
app.use('/api/notifications', require('./src/routes/notifications')); // Register Notification routes
app.use('/api/geocoding', require('./src/routes/geocoding'));
app.use('/api/map-assets', require('./src/routes/mapAssets')); // Register Map Asset routes
app.use('/api/google', require('./src/routes/google')); // Register Google Integration routes
app.use('/api/xero', require('./src/routes/xero')); // Register Xero Integration routes
app.use('/api/workflows', require('./src/routes/workflowRoutes')); // Register Workflow routes
app.use('/api/clients', require('./src/routes/clients')); // Register Client routes
app.use('/api/documents', require('./src/routes/documents')); // Register Documents routes
app.use('/api/allocations', require('./src/routes/allocations')); // Register Allocation routes
app.use('/api/safety', require('./src/routes/safetyRoutes')); // Register Safety & Compliance routes
app.use('/api/reports', require('./src/routes/reportRoutes')); // Unified Reports Hub
app.use('/api/mail', require('./src/routes/mail')); // Email Service
app.use('/api/ai', require('./src/routes/ai')); // Grok AI Service
app.use('/api/intelligence', require('./src/routes/intelligenceRoutes')); // NEW: Intelligence Stack
app.use('/api/weather', require('./src/routes/weather')); // Weather Service
app.use('/api/diary-templates', require('./src/routes/diaryTemplates')); // Diary Templates Route

// --- SERVE UPLOADS (Static) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Force register error handler last
app.use(globalErrorHandler);

const bcrypt = require('bcryptjs'); // Ensure bcrypt is required

// ... existing imports

// --- MAINTENANCE ROUTES (RESTRICTED) ---
const areDebugRoutesEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEBUG_ROUTES === 'true';

// Database Schema Fix Engine (Shared)
// const runSchemaFix = require('./src/utils/manualSchemaFix');

if (areDebugRoutesEnabled) {
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
        const existingSettings = await db.Settings.findOne();
        if (!existingSettings) {
          await db.Settings.create({
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

    // Database Schema Fix Route (Emergency)
    app.get('/api/fix-schema', async (req, res) => {
      try {
        const secret = req.query.secret;
        // Allow DB_PASSWORD or a hardcoded emergency secret
        if (secret !== process.env.DB_PASSWORD && secret !== 'masterfix2026') { 
           return res.status(403).send('Unauthorized: Invalid secret');
        }
        
        console.log('Starting manual schema fix...');
        const results = await runSchemaFix();
        console.log('Schema fix results:', results);
        
        res.json({
          success: true,
          message: 'Schema patch execution completed',
          results: results
        });
      } catch (error) {
        console.error('Schema Fix Error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // --- SCHEMA DEBUG & REPAIR (LIVE) ---
    const schemaDebugController = require('./src/controllers/schemaDebugController');
    app.get('/api/debug/schema/quotes', schemaDebugController.inspectQuotesTable);
    app.get('/api/debug/fix-quotes', schemaDebugController.forceFixQuotesTable);
} else {
    // Block these routes in production
    app.get('/api/seed-secret', (req, res) => res.status(404).send('Not Found'));
    app.get('/api/fix-schema', (req, res) => res.status(404).send('Not Found'));
    app.get('/api/debug/*', (req, res) => res.status(404).send('Not Found'));
}

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
  const fs = require('fs');
  const localPublicPath = path.join(__dirname, 'public');
  const devPublicPath = path.join(__dirname, '../frontend/dist');
  
  // Prioritize local 'public' folder (Deployment) over dev path
  const frontendPath = fs.existsSync(localPublicPath) ? localPublicPath : devPublicPath;
  
  console.log(`Serving static files from: ${frontendPath}`);
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
  console.log('Safety Model Check:', db.SafetyTemplate ? 'Loaded' : 'MISSING'); // Debug check
  console.log(`Loaded GROK_API_KEY: ${process.env.GROK_API_KEY ? process.env.GROK_API_KEY.substring(0, 4) + '...' : 'UNDEFINED'}`);
});

// Database connection (Background)
db.sequelize.authenticate()
  .then(async () => {
    // Database connected successfully
    console.log('Database connected successfully.');
    
    // --- EMERGENCY: AUTO-REPAIR SCHEMA ON STARTUP ---
    // DISABLED for 1vCPU stability. Use /api/fix-schema?secret=... to trigger manually if needed.
    /*
    runSchemaFix().then(results => {
        console.log('Lattice Fix Results:', results);
    }).catch(err => {
        console.error('Lattice Fix Failed:', err.message);
    });
    */

    // Enable alter: true to ensure Postgres schema updates for new features (Map, Workflow, etc.)
    return db.sequelize.sync({ alter: true }); 
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

// Force restart trigger