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
const fs = require('fs');

// Load Env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
require('dotenv').config({ path: path.resolve(__dirname, './.env'), override: true });

// PG Int parsing
if (process.env.NODE_ENV === 'production') {
  try {
    const pg = require('pg');
    pg.defaults.parseInt8 = true;
  } catch (e) {}
}

// Initialize App
const app = express();
const PORT = process.env.PORT || 5003;

// --- 1. CRITICAL: SERVE STATIC FILES FIRST (PREVENT BLACK SCREEN) ---
// This ensures frontend loads immediately, regardless of DB status
const localPublicPath = path.join(__dirname, 'public');
const devPublicPath = path.join(__dirname, '../frontend/dist');
const frontendPath = fs.existsSync(localPublicPath) ? localPublicPath : devPublicPath;

console.log(`Serving static files from: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- 2. STANDARD MIDDLEWARE ---
// Traceability
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  console.log(`[Request] ${req.method} ${req.url} (ID: ${req.id})`);
  next();
});

// Security & Parsing
app.set('trust proxy', 1);
/*
app.use(rateLimit({
  windowMs: 60 * 1000, 
  max: 1000,
  validate: { xForwardedForHeader: false }
}));
*/

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://*.googleapis.com", "https://www.youtube.com", "https://s.ytimg.com", "https://*.youtube.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "blob:", "https://maps.gstatic.com", "https://*.googleapis.com", "https://*.googleusercontent.com", "https://*.ggpht.com", "https://img.youtube.com", "https://i.ytimg.com", "https://www.transparenttextures.com", "https://*.ytimg.com", "https://*.youtube.com", "https://grainy-gradients.vercel.app", "https://imgen.x.ai", "https://*.x.ai"],
      "connect-src": ["'self'", "ws:", "wss:", "https://maps.googleapis.com", "https://*.googleapis.com", "https://*.youtube.com", "https://*.google.com"],
      "frame-src": ["'self'", "https://js.stripe.com", "https://www.youtube.com", "https://youtube.com", "https://*.youtube.com", "https://*.youtube-nocookie.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
app.use(cors()); // Allow CORS
app.use(cookieParser());

// JSON Body Parser
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/stripe/webhook')) req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 3. HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', uptime: process.uptime() });
});

// --- 4. ROUTES ---
// Import routes conventionally to ensure they load correctly
try {
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
    app.use('/api/stripe', require('./src/routes/stripe'));
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/uploads', require('./src/routes/uploads'));
    app.use('/api/notifications', require('./src/routes/notifications'));
    app.use('/api/geocoding', require('./src/routes/geocoding'));
    app.use('/api/map-assets', require('./src/routes/mapAssets'));
    app.use('/api/google', require('./src/routes/google'));
    app.use('/api/xero', require('./src/routes/xero'));
    app.use('/api/workflows', require('./src/routes/workflowRoutes'));
    app.use('/api/clients', require('./src/routes/clients'));
    app.use('/api/documents', require('./src/routes/documents'));
    app.use('/api/allocations', require('./src/routes/allocations'));
    app.use('/api/safety', require('./src/routes/safetyRoutes'));
    app.use('/api/reports', require('./src/routes/reportRoutes'));
    app.use('/api/mail', require('./src/routes/mail'));
    app.use('/api/ai', require('./src/routes/ai'));
    app.use('/api/intelligence', require('./src/routes/intelligenceRoutes'));
    app.use('/api/weather', require('./src/routes/weather'));
    app.use('/api/diary-templates', require('./src/routes/diaryTemplates'));
    app.use('/api/sentinel', require('./src/routes/sentinel'));
    app.use('/api/contracts', require('./src/routes/contracts'));
    app.use('/api/manifest', require('./src/routes/manifestRoutes'));
    
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (error) {
    console.error("❌ Route Import Error:", error);
}

// --- 5. ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Failure' : err.message
  });
});

// --- 6. CATCH-ALL FOR SPA ---
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- 7. START SERVER & DB ---
const server = app.listen(PORT, () => {
  console.log(`🚀 MasterDiaryOS Stable Core online on port ${PORT}`);
  
  // Connect to DB in background
  initDatabase().catch(err => console.error("DB Init Failed:", err));
});

async function initDatabase() {
    try {
        const db = require('./src/models');
        const { loadSettings } = require('./src/utils/settingsCache');
        const runSchemaFix = require('./src/utils/manualSchemaFix');
        
        await db.sequelize.authenticate();
        console.log('✅ Lattice Connection Secured.');

        if (typeof runSchemaFix === 'function') {
            runSchemaFix().catch(err => console.error('Lattice Fix Error:', err.message));
        }

        // Alter only in non-production or if strictly needed
        await db.sequelize.sync({ alter: false }); 
        console.log('✨ Schema Synchronized.');

        await loadSettings();
        console.log('🧠 Settings Loaded.');
    } catch (err) {
        console.error('❌ Lattice Initialization Failed:', err.message);
    }
}

// Prevent crash on unhandled
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});