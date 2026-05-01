const express = require('express');
const router = express.Router();
const { upload } = require('../utils/storage');
const { authenticateToken } = require('../middleware/auth');

// Protect uploads with authentication
router.use(authenticateToken);

// Standardize on 'image' field for construction visual data
router.post('/', upload.single('image'), (req, res) => {
  const file = req.file;

  if (!file) {
    console.error("[Upload Route] No file found in req.file. Expected field: 'image'");
    return res.status(400).json({ error: 'No file uploaded. Expected multipart/form-data field: "image"' });
  }

  // Construct public URL
  let fileUrl;
  if (process.env.NODE_ENV === 'production') {
    fileUrl = file.path; // Google Storage URL from custom engine
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

