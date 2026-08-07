import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists locally for fallback
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage service configured.');
} else {
  console.log('Cloudinary not configured. Falling back to local disk storage.');
}

/**
 * Upload an image buffer to Cloudinary or local disk
 * @param {Buffer} buffer - The image file buffer
 * @param {string} filename - The filename to save (for local storage)
 * @param {string} folder - The Cloudinary folder or subfolder
 * @param {object} req - Express request object to resolve host URL if saving locally
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export const uploadImage = async (buffer, filename, folder = 'hh-goa-2026', req = null) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          public_id: path.parse(filename).name,
          format: 'png' // ensure high-quality PNG format
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } else {
    // Local fallback storage
    const localFilePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(localFilePath, buffer);
    
    // Construct dynamic server URL based on the request
    if (req) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      return `${protocol}://${host}/uploads/${filename}`;
    }
    
    // If request context isn't available, return fallback relative path
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${filename}`;
  }
};

/**
 * Delete an image from Cloudinary or local disk
 * @param {string} imageUrl - The full URL of the image
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return false;
  
  if (isCloudinaryConfigured && imageUrl.includes('cloudinary.com')) {
    try {
      // Extract public ID from Cloudinary URL
      // E.g., https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/filename.png -> folder/filename
      const parts = imageUrl.split('/');
      const filenameWithExtension = parts.pop();
      const folderName = parts.pop();
      const publicId = `${folderName}/${path.parse(filenameWithExtension).name}`;
      
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      return false;
    }
  } else {
    try {
      // Extract local filename from URL
      const filename = imageUrl.split('/uploads/').pop();
      if (filename) {
        const localFilePath = path.join(uploadsDir, filename);
        if (fs.existsSync(localFilePath)) {
          await fs.promises.unlink(localFilePath);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to delete local file:', error);
      return false;
    }
  }
  return false;
};
