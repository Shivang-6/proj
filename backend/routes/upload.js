// routes/upload.js (or utils/upload.js)
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for CampusKart product uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campuskart/products', // 👈 Cloudinary folder name for CampusKart
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }], // Optional image resize
  },
});

const upload = multer({ storage });

export default upload;
