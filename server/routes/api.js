import express from 'express';
import upload from '../middleware/upload.js';
import { 
  uploadImageFile, 
  generateFrame, 
  generateCard, 
  getImageMetadata, 
  deleteImageMetadata,
  getRecentGallery
} from '../controllers/imageController.js';

const router = express.Router();

// File upload endpoints (with multer memory storage)
router.post('/upload', upload.single('image'), uploadImageFile);
router.post('/generate/frame', upload.single('image'), generateFrame);
router.post('/generate/card', upload.single('image'), generateCard);

// Gallery and metadata endpoints
router.get('/gallery', getRecentGallery);
router.get('/image/:shareId', getImageMetadata);
router.delete('/image/:shareId', deleteImageMetadata);

export default router;
