const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'master-diary-uploads';

// Configure Local Storage (Fallback/Dev)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure Google Cloud Storage Engine for Multer
const googleStorage = {
  _handleFile: (req, file, cb) => {
    const bucket = storage.bucket(bucketName);
    const fileName = `uploads/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(fileName);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
      cb(err);
    });

    blobStream.on('finish', () => {
      // publicUrl is: https://storage.googleapis.com/${bucket.name}/${blob.name}
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      cb(null, {
        path: publicUrl,
        filename: fileName,
        mimetype: file.mimetype
      });
    });

    file.stream.pipe(blobStream);
  },
  _removeFile: (req, file, cb) => {
    // Optional: Implement deletion
    cb(null);
  }
};

// Select engine based on environment
const storageEngine = process.env.NODE_ENV === 'production' ? googleStorage : localStorage;

const upload = multer({ 
  storage: storageEngine,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = { upload };
