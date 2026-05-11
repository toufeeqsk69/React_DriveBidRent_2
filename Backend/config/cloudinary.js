// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage and upload to Cloudinary in controllers via helper
const storage = multer.memoryStorage();

// Multer upload instance (stores file in memory as buffer)
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype && (
      file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf'
    )) {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'), false);
    }
  }
});

export { upload, cloudinary };