

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for multer (files will be uploaded directly to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 25 * 1024 * 1024, // 25MB limit
    fieldNameSize: 255,
    fieldSize: 1024 * 1024 * 2 // 2MB for fields
  },
  fileFilter: (req, file, cb) => {
    console.log('[MULTER] Processing file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    // Accept all image types
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const multerErrorHandler = (error, req, res, next) => {
  console.error('[MULTER ERROR]:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }
  
  // For boundary errors
  if (error.message.includes('Boundary') || error.message.includes('boundary')) {
    return res.status(400).json({ 
      message: 'Invalid multipart data', 
      error: error.message 
    });
  }
  
  next(error);
};



const { signup, login, getUserData, signupPartner, uploadProfile ,getUserProfileImage,resetPassword } = require('../Controller/AccountController');

// Debug middleware to log request details
const debugMiddleware = (req, res, next) => {
  console.log('[DEBUG] === INCOMING REQUEST ===');
  console.log('[DEBUG] Method:', req.method);
  console.log('[DEBUG] URL:', req.url);
  console.log('[DEBUG] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[DEBUG] Content-Type:', req.headers['content-type']);
  console.log('[DEBUG] Content-Length:', req.headers['content-length']);
  console.log('[DEBUG] Body keys:', Object.keys(req.body || {}));
  console.log('[DEBUG] Has file in request?', !!req.file);
  console.log('[DEBUG] Has files in request?', !!req.files);
  next();
};



router.post('/upload/profile', debugMiddleware, upload.single('file'), multerErrorHandler, uploadProfile);
router.post('/test-upload', debugMiddleware, upload.single('file'), (req, res) => {
  console.log('[TEST-UPLOAD] Body:', req.body);
  console.log('[TEST-UPLOAD] File:', req.file);
  res.json({
    message: 'Test upload received',
    hasFile: !!req.file,
    body: req.body,
    fileInfo: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null
  });
});
router.get('/image',getUserProfileImage)
router.get('/getUserData', getUserData);
router.post('/signup', signup);
router.post('/signupPartner', signupPartner);
router.post('/login', login);
router.post('/chagnepassword',resetPassword);


module.exports = router;
