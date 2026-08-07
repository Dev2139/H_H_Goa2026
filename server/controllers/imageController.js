import crypto from 'crypto';
import Image from '../models/Image.js';
import { uploadImage, deleteImage } from '../services/storage.js';
import { 
  convertHeicToPng, 
  generateProfileFrame, 
  generateBuilderCard 
} from '../utils/imageProcessor.js';
import { getRandomBuilderTitle } from '../utils/builderTitles.js';

// Helper to generate a short unique ID
const generateShortId = () => crypto.randomBytes(6).toString('hex');

/**
 * Handle direct file upload (e.g. for preview before generating)
 */
export const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    let buffer = req.file.buffer;
    let originalName = req.file.originalname;

    // Convert HEIC/HEIF to PNG if needed
    const fileExtension = originalName.split('.').pop().toLowerCase();
    if (['heic', 'heif'].includes(fileExtension) || req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
      console.log('Converting HEIC image to PNG...');
      buffer = await convertHeicToPng(buffer);
      originalName = originalName.replace(/\.(heic|heif)$/i, '.png');
    }

    const uniqueFilename = `raw-${Date.now()}-${generateShortId()}.png`;
    const imageUrl = await uploadImage(buffer, uniqueFilename, 'hh-goa-2026/uploads', req);

    return res.status(200).json({
      message: 'Upload successful',
      imageUrl
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image.' });
  }
};

/**
 * Generate Profile Picture Frame
 */
export const generateFrame = async (req, res) => {
  try {
    let buffer;
    const enhance = req.body.enhance === 'true' || req.body.enhance === true;

    if (req.file) {
      buffer = req.file.buffer;
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      if (['heic', 'heif'].includes(fileExtension) || req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
        buffer = await convertHeicToPng(buffer);
      }
    } else if (req.body.photoUrl) {
      console.log('Fetching photo from URL:', req.body.photoUrl);
      const response = await fetch(req.body.photoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch photo from provided URL.');
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      return res.status(400).json({ error: 'Please upload an image or provide a photo URL.' });
    }

    const shareId = generateShortId();
    console.log(`Generating PFP Frame for shareId: ${shareId}, enhance: ${enhance}`);
    
    // Generate the PFP
    const generatedBuffer = await generateProfileFrame(buffer, enhance);
    
    // Upload generated PNG
    const filename = `pfp-${shareId}.png`;
    const generatedImageUrl = await uploadImage(generatedBuffer, filename, 'hh-goa-2026/generated', req);

    // Save record to DB
    const imageRecord = new Image({
      imageType: 'frame',
      generatedImageUrl,
      shareId
    });
    await imageRecord.save();

    return res.status(201).json(imageRecord);
  } catch (error) {
    console.error('Frame generation controller error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate frame.' });
  }
};

/**
 * Generate Builder Badge Card
 */
export const generateCard = async (req, res) => {
  try {
    const { name, role, stack } = req.body;
    const enhance = req.body.enhance === 'true' || req.body.enhance === true;

    if (!name || !role || !stack) {
      return res.status(400).json({ error: 'Name, Role, and Tech Stack are required.' });
    }

    let buffer;
    if (req.file) {
      buffer = req.file.buffer;
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      if (['heic', 'heif'].includes(fileExtension) || req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
        buffer = await convertHeicToPng(buffer);
      }
    } else if (req.body.photoUrl) {
      console.log('Fetching photo from URL:', req.body.photoUrl);
      const response = await fetch(req.body.photoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch photo from provided URL.');
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      return res.status(400).json({ error: 'Please upload an image or provide a photo URL.' });
    }

    const shareId = generateShortId();
    const builderTitle = getRandomBuilderTitle();
    
    // Construct dynamic sharing url
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/share/${shareId}`;

    console.log(`Generating Builder Card for ${name} (${shareId}), Title: ${builderTitle}, enhance: ${enhance}`);

    // Generate Card Buffer
    const generatedBuffer = await generateBuilderCard(buffer, {
      name,
      role,
      stack,
      builderTitle,
      shareUrl
    }, enhance);

    // Upload final card
    const filename = `card-${shareId}.png`;
    const generatedImageUrl = await uploadImage(generatedBuffer, filename, 'hh-goa-2026/generated', req);

    // Save record to DB
    const imageRecord = new Image({
      name,
      role,
      stack,
      builderTitle,
      imageType: 'card',
      generatedImageUrl,
      shareId
    });
    await imageRecord.save();

    return res.status(201).json(imageRecord);
  } catch (error) {
    console.error('Card generation controller error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate builder card.' });
  }
};

/**
 * Get metadata by share ID
 */
export const getImageMetadata = async (req, res) => {
  try {
    const { shareId } = req.params;
    const imageRecord = await Image.findOne({ shareId });

    if (!imageRecord) {
      return res.status(404).json({ error: 'Badge not found or expired.' });
    }

    return res.status(200).json(imageRecord);
  } catch (error) {
    console.error('Get image metadata error:', error);
    return res.status(500).json({ error: 'Failed to retrieve badge metadata.' });
  }
};

/**
 * Delete image by share ID
 */
export const deleteImageMetadata = async (req, res) => {
  try {
    const { shareId } = req.params;
    const imageRecord = await Image.findOne({ shareId });

    if (!imageRecord) {
      return res.status(404).json({ error: 'Badge not found or already deleted.' });
    }

    // Delete image from storage
    await deleteImage(imageRecord.generatedImageUrl);

    // Delete from DB
    await Image.deleteOne({ shareId });

    return res.status(200).json({ message: 'Badge deleted successfully.' });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({ error: 'Failed to delete badge.' });
  }
};

/**
 * Get Recent Frames Gallery (Nice Extra)
 */
export const getRecentGallery = async (req, res) => {
  try {
    // Return last 8 generated cards/frames for the showcase gallery
    const recent = await Image.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('shareId imageType generatedImageUrl name builderTitle');
      
    return res.status(200).json(recent);
  } catch (error) {
    console.error('Get recent gallery error:', error);
    return res.status(500).json({ error: 'Failed to retrieve recent cards.' });
  }
};

/**
 * HTML Response with dynamic Open Graph tags for X/Twitter sharing crawlers
 */
export const serveSharePage = async (req, res) => {
  try {
    const { shareId } = req.params;
    const imageRecord = await Image.findOne({ shareId });

    if (!imageRecord) {
      // Fallback redirect if not found
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.send(`
        <html>
          <head>
            <script>window.location.href = "${frontendUrl}";</script>
          </head>
          <body>Redirecting to HH Goa 2026 Frame Generator...</body>
        </html>
      `);
    }

    const { name, imageType, generatedImageUrl, builderTitle } = imageRecord;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/share/${shareId}`;

    const title = imageType === 'card' 
      ? `HH Goa 2026 Badge | ${name || 'Builder'}` 
      : 'HH Goa 2026 Official Profile Frame';
      
    const description = imageType === 'card'
      ? `Check out ${name || 'Builder'}'s official HH Goa 2026 Badge as a ${builderTitle || 'Hacker'}! Create yours now.`
      : 'Generate your official HH Goa 2026 profile frame in seconds.';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${generatedImageUrl}" />
  <meta property="og:url" content="${redirectUrl}" />
  <meta property="og:site_name" content="HH Goa Frame Generator" />
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${generatedImageUrl}" />
  <meta name="twitter:site" content="@HHGoa" />

  <style>
    body {
      background-color: #05070F;
      color: #FFFFFF;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      text-align: center;
      max-width: 500px;
      padding: 24px;
      background: rgba(12, 15, 29, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      backdrop-filter: blur(16px);
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #8B5CF6 0%, #F97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94A3B8;
      font-size: 15px;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
      color: white;
      text-decoration: none;
      font-weight: 700;
      border-radius: 30px;
      box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4);
    }
  </style>
  
  <script>
    // Redirect normal browsers to the interactive SPA
    setTimeout(function() {
      window.location.href = "${redirectUrl}";
    }, 2000);
  </script>
</head>
<body>
  <div class="container">
    <h1>HH GOA 2026</h1>
    <img src="${generatedImageUrl}" alt="${title}" />
    <p>Loading interactive builder badge view... If you are not redirected, click the button below.</p>
    <a class="btn" href="${redirectUrl}">View Badge</a>
  </div>
</body>
</html>
`;
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Serve share page error:', error);
    return res.status(500).send('Internal Server Error');
  }
};
