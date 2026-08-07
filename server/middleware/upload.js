import multer from 'multer';

// Use memory storage to process files directly in buffer (faster, works on ephemeral servers)
const storage = multer.memoryStorage();

// Allowed file extensions
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  
  if (
    ALLOWED_MIMETYPES.includes(mimeType) || 
    ['heic', 'heif', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and HEIC images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB size limit
  },
  fileFilter: fileFilter
});

export default upload;
