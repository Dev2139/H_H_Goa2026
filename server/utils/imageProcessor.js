import sharp from 'sharp';
import heicConvert from 'heic-convert';
import QRCode from 'qrcode';

// XML Escaper for SVG generation safety
export function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Converts HEIC/HEIF buffer to PNG buffer
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>}
 */
export async function convertHeicToPng(buffer) {
  try {
    return await heicConvert({
      buffer: buffer,
      format: 'PNG'
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error('Could not convert HEIC image to PNG');
  }
}

/**
 * Process Format A: Profile Picture Frame (1080x1080)
 * @param {Buffer} photoBuffer - Raw user photo buffer (must be PNG/JPG)
 * @param {boolean} enhance - Enhance brightness & saturation toggle
 * @returns {Promise<Buffer>} Generated image PNG buffer
 */
export async function generateProfileFrame(photoBuffer, enhance = false) {
  // 1. Prepare user image with optional enhancement
  let userSharp = sharp(photoBuffer);
  
  if (enhance) {
    userSharp = userSharp.modulate({
      brightness: 1.08,
      saturation: 1.15
    });
  }
  
  // Resize to 1080x1080 cover
  const resizedUser = await userSharp
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Create circular mask
  const circleMask = Buffer.from(
    `<svg width="1080" height="1080">
       <circle cx="540" cy="540" r="500" fill="white"/>
     </svg>`
  );

  // Apply circular mask to the user image
  const maskedUser = await sharp(resizedUser)
    .composite([{
      input: circleMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // 3. Define the SVG overlay with tropical branding
  const overlaySvg = Buffer.from(
    `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="beachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="#8B5CF6" />
           <stop offset="35%" stop-color="#3B82F6" />
           <stop offset="70%" stop-color="#F97316" />
           <stop offset="100%" stop-color="#EAB308" />
         </linearGradient>
         <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur stdDeviation="15" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
         </filter>
       </defs>

       <!-- Outer glowing gradient border -->
       <circle cx="540" cy="540" r="500" stroke="url(#beachGrad)" stroke-width="20" fill="none" />
       
       <!-- Inner border shadow overlay -->
       <circle cx="540" cy="540" r="490" stroke="#000000" stroke-width="4" fill="none" opacity="0.4" />
       
       <!-- Decorative beach elements / Palm leaves (Vector drawing) -->
       <!-- Left Palm Leaf -->
       <path d="M120,400 Q80,500 130,600 Q180,500 120,400 Z" fill="url(#beachGrad)" opacity="0.8" />
       <path d="M110,430 Q60,520 120,610 Q160,510 110,430 Z" fill="url(#beachGrad)" opacity="0.6" />
       
       <!-- Right Palm Leaf -->
       <path d="M960,400 Q1000,500 950,600 Q900,500 960,400 Z" fill="url(#beachGrad)" opacity="0.8" />
       <path d="M970,430 Q1020,520 960,610 Q920,510 970,430 Z" fill="url(#beachGrad)" opacity="0.6" />
       
       <!-- Waves at the bottom -->
       <path d="M160,780 Q320,830 540,780 T920,780 L920,850 L160,850 Z" fill="url(#beachGrad)" opacity="0.25" />
       <path d="M180,810 Q340,850 540,810 T900,810 L900,860 L180,860 Z" fill="url(#beachGrad)" opacity="0.15" />
       
       <!-- Glassmorphic bottom banner for text -->
       <g filter="url(#glow)">
         <rect x="340" y="910" width="400" height="76" rx="38" fill="#0A0F1D" fill-opacity="0.85" stroke="url(#beachGrad)" stroke-width="4" />
       </g>
       <text x="540" y="958" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="30" font-weight="900" letter-spacing="6" text-anchor="middle">HH GOA 2026</text>
       
       <!-- Top Builder Badge -->
       <rect x="440" y="66" width="200" height="42" rx="21" fill="#0A0F1D" fill-opacity="0.85" stroke="url(#beachGrad)" stroke-width="2.5" />
       <text x="540" y="92" fill="#EAB308" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="3" text-anchor="middle">BUILDER</text>
     </svg>`
  );

  // 4. Composite the overlay onto the masked image
  return await sharp(maskedUser)
    .composite([{
      input: overlaySvg,
      top: 0,
      left: 0
    }])
    .png()
    .toBuffer();
}

/**
 * Process Format B: Builder Card (1080x1350)
 * @param {Buffer} photoBuffer - Raw user photo buffer
 * @param {object} details - { name, role, stack, builderTitle, shareUrl }
 * @param {boolean} enhance - Enhance brightness & saturation toggle
 * @returns {Promise<Buffer>} Generated card PNG buffer
 */
export async function generateBuilderCard(photoBuffer, details, enhance = false) {
  const { name, role, stack, builderTitle, shareUrl } = details;
  const escapedName = escapeXml(name).toUpperCase();
  const escapedRole = escapeXml(role);
  const escapedStack = escapeXml(stack);
  const escapedTitle = escapeXml(builderTitle).toUpperCase();

  // 1. Prepare user image with optional enhancement
  let userSharp = sharp(photoBuffer);
  
  if (enhance) {
    userSharp = userSharp.modulate({
      brightness: 1.08,
      saturation: 1.15
    });
  }

  // Create rounded rectangle mask for the card photo (400x400, rx=40)
  const photoSize = 400;
  const roundedMask = Buffer.from(
    `<svg width="${photoSize}" height="${photoSize}">
       <rect x="0" y="0" width="${photoSize}" height="${photoSize}" rx="40" ry="40" fill="white"/>
     </svg>`
  );

  // Resize and mask user photo
  const processedUserPhoto = await userSharp
    .resize(photoSize, photoSize, { fit: 'cover', position: 'center' })
    .composite([{
      input: roundedMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // 2. Generate custom QR Code
  // Generate QR Code with white lines on transparent background
  const qrCodeBuffer = await QRCode.toBuffer(shareUrl || 'https://hhgoa.in', {
    width: 140,
    margin: 1,
    color: {
      dark: '#FFFFFF', // White QR code dots
      light: '#00000000' // Transparent background
    }
  });

  // 3. Create background image (1080x1350 with gradients and glowing orbs)
  const bgSvg = Buffer.from(
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
           <stop offset="0%" stop-color="#060814" />
           <stop offset="50%" stop-color="#0C0F24" />
           <stop offset="100%" stop-color="#03040A" />
         </linearGradient>
         <filter id="orbBlur" x="-50%" y="-50%" width="200%" height="200%">
           <feGaussianBlur stdDeviation="100" />
         </filter>
       </defs>
       
       <rect width="1080" height="1350" fill="url(#bgGrad)" />
       
       <!-- Glowing beach theme orbs -->
       <circle cx="150" cy="250" r="280" fill="#8B5CF6" opacity="0.22" filter="url(#orbBlur)" />
       <circle cx="950" cy="1150" r="320" fill="#F97316" opacity="0.18" filter="url(#orbBlur)" />
       <circle cx="850" cy="300" r="250" fill="#3B82F6" opacity="0.12" filter="url(#orbBlur)" />
       <circle cx="200" cy="1100" r="250" fill="#EAB308" opacity="0.1" filter="url(#orbBlur)" />
     </svg>`
  );

  const backgroundBuffer = await sharp(bgSvg).png().toBuffer();

  // 4. Create the main card structure and text overlay SVG
  const cardOverlaySvg = Buffer.from(
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="beachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="#8B5CF6" />
           <stop offset="35%" stop-color="#3B82F6" />
           <stop offset="70%" stop-color="#F97316" />
           <stop offset="100%" stop-color="#EAB308" />
         </linearGradient>
         <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur stdDeviation="25" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
         </filter>
       </defs>

       <!-- Card Shape (x: 120, y: 120, w: 840, h: 1110) -->
       <!-- Outer fine neon card border -->
       <rect x="116" y="116" width="848" height="1118" rx="48" stroke="url(#beachGrad)" stroke-width="3" fill="none" opacity="0.5" />
       
       <!-- Card body: Glassmorphic semi-transparent container -->
       <rect x="120" y="120" width="840" height="1110" rx="44" fill="#0C0F1D" fill-opacity="0.75" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />
       
       <!-- Card branding elements -->
       <g filter="url(#cardGlow)">
         <!-- Little orange accent line at the top -->
         <rect x="440" y="120" width="200" height="6" rx="3" fill="url(#beachGrad)" />
       </g>

       <!-- Event Logo & Header -->
       <g transform="translate(540, 205)">
         <!-- Stylized Logo Symbol -->
         <path d="M-25,-25 C-35,-15 -35,5 -25,15 C-15,25 5,25 15,15 C25,5 25,-15 15,-25 Z" fill="none" stroke="url(#beachGrad)" stroke-width="4" opacity="0.9" />
         <circle cx="-5" cy="-5" r="8" fill="#EAB308" />
         <circle cx="5" cy="5" r="6" fill="#F97316" />
         
         <text x="35" y="5" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="3">HH GOA</text>
         <text x="35" y="28" fill="#A0AEC0" font-family="'Inter', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="5">2026 BUILDER</text>
       </g>

       <!-- Photo Frame Glow (centered horizontally: X = 540 - 200 - 8 = 332) -->
       <rect x="332" y="272" width="416" height="416" rx="48" stroke="url(#beachGrad)" stroke-width="6" fill="none" opacity="0.8" />
       <rect x="336" y="276" width="408" height="408" rx="44" stroke="#000000" stroke-width="2" fill="none" opacity="0.3" />

       <!-- Detail Fields -->
       <!-- Name (Centered, bold, white) -->
       <text x="540" y="785" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="54" font-weight="900" text-anchor="middle" letter-spacing="1">${escapedName}</text>
       
       <!-- Role & Tech Stack -->
       <text x="540" y="845" fill="#94A3B8" font-family="'Inter', system-ui, sans-serif" font-size="28" font-weight="700" text-anchor="middle">${escapedRole}</text>
       
       <!-- Stack pill style representation -->
       <text x="540" y="895" fill="#64748B" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle">${escapedStack}</text>
       
       <!-- Auto Builder Title Badge -->
       <g transform="translate(540, 960)">
         <rect x="-210" y="-30" width="420" height="60" rx="30" fill="#131930" fill-opacity="0.9" stroke="url(#beachGrad)" stroke-width="2.5" />
         <text x="0" y="8" fill="#F97316" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="900" letter-spacing="4" text-anchor="middle">${escapedTitle}</text>
       </g>
       
       <!-- QR Code Container frame -->
       <rect x="696" y="1036" width="148" height="148" rx="16" fill="#131930" fill-opacity="0.6" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />

       <!-- Technical Badge Data (Left side of footer) -->
       <g transform="translate(180, 1055)" font-family="monospace">
         <text x="0" y="20" fill="#64748B" font-size="14" font-weight="700">SYS: <tspan fill="#A0AEC0">HH-GOA-2026</tspan></text>
         <text x="0" y="45" fill="#64748B" font-size="14" font-weight="700">STATUS: <tspan fill="#10B981">VERIFIED</tspan></text>
         <text x="0" y="70" fill="#64748B" font-size="14" font-weight="700">LOC: <tspan fill="#3B82F6">GOA, IN</tspan></text>
         <text x="0" y="95" fill="#64748B" font-size="14" font-weight="700">BADGE: <tspan fill="#EAB308">#HACKER</tspan></text>
       </g>
     </svg>`
  );

  // 5. Composite everything together
  // Base background (1080x1350)
  // + User Photo (placed at left: 340, top: 280)
  // + QR Code (placed at left: 700, top: 1040)
  // + SVG Card Details & Text Overlay (1080x1350)
  return await sharp(backgroundBuffer)
    .composite([
      {
        input: processedUserPhoto,
        top: 280,
        left: 340
      },
      {
        input: qrCodeBuffer,
        top: 1040,
        left: 700
      },
      {
        input: cardOverlaySvg,
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();
}
