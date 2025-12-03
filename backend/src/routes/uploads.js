const express = require('express');
const router = express.Router();
const { upload } = require('../utils/storage');
const { authenticateToken } = require('../middleware/auth');

// Protect uploads with authentication
router.use(authenticateToken);

// Accept 'image' OR 'file' field
router.post('/', (req, res, next) => {
    // Middleware to handle either field name
    upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }])(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, (req, res) => {
  const file = req.files['file'] ? req.files['file'][0] : (req.files['image'] ? req.files['image'][0] : null);

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construct public URL
  let fileUrl;
  if (process.env.NODE_ENV === 'production') {
    fileUrl = file.path; // Google Storage URL
  } else {
    // Local development URL
    const protocol = req.protocol;
    const host = req.get('host');
    fileUrl = `${protocol}://${host}/${file.path.replace(/\\/g, '/')}`;
  }

  res.json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: file.filename
  });
});

module.exports = router;

