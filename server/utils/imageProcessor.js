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
 * Process raw photo - scales the image so that it fits ENTIRELY (contain fit) inside the box
 * when zoom = 1.0, and then centers and translates it based on pan values.
 */
async function processUserPhoto(photoBuffer, params, targetWidth = 360, targetHeight = 360, isFrame = false) {
  const { zoom = 1.0, panX = 0, panY = 0, brightness = 100, filter = 'normal' } = params;
  
  // 1. Initialize Sharp instance with EXIF auto-rotation
  let img = sharp(photoBuffer).rotate();
  
  // 2. Apply Brightness Correction
  if (brightness !== 100) {
    img = img.modulate({
      brightness: Math.max(0.1, brightness / 100)
    });
  }
  
  // 3. Apply Color Filter Presets
  const f = (filter || '').toLowerCase();
  if (f === 'grayscale') {
    img = img.greyscale();
  } else if (f === 'sepia') {
    img = img.modulate({ saturation: 0.75 }).tint({ r: 112, g: 66, b: 20 });
  } else if (f === 'cool') {
    img = img.modulate({ saturation: 1.1 }).tint({ r: 25, g: 50, b: 90 });
  } else if (f === 'warm') {
    img = img.modulate({ saturation: 1.1 }).tint({ r: 90, g: 45, b: 20 });
  }

  // 4. Calculate dimensions so that the ENTIRE image fits inside the target box (aspect ratio preserved)
  const metadata = await img.metadata();
  const originalWidth = metadata.width || 500;
  const originalHeight = metadata.height || 500;

  // baseScale is fit-to-box scale (contain fit)
  const baseScale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
  const finalScale = (baseScale * zoom) || baseScale || 1.0;
  
  const resizedWidth = Math.max(1, Math.round(originalWidth * finalScale));
  const resizedHeight = Math.max(1, Math.round(originalHeight * finalScale));
  
  const resizedBuffer = await img
    .resize(resizedWidth, resizedHeight)
    .png()
    .toBuffer();

  // 5. Composite the resized photo onto a background canvas (failsafe against out-of-bounds crop)
  const canvasBg = isFrame ? 'none' : '#F3F4F0';
  const canvasSvg = Buffer.from(
    `<svg width="${targetWidth}" height="${targetHeight}">
       <rect width="100%" height="100%" fill="${canvasBg}" />
     </svg>`
  );
  
  // Centered position + user pan offsets
  const left = Math.round(targetWidth / 2 - resizedWidth / 2 + (panX || 0));
  const top = Math.round(targetHeight / 2 - resizedHeight / 2 + (panY || 0));
  
  return await sharp(canvasSvg)
    .composite([{
      input: resizedBuffer,
      left,
      top
    }])
    .png()
    .toBuffer();
}

// Color palettes mapping to style selections (For Format A: PFP frame only)
const themeColors = {
  emerald: { gradients: ['#10B981', '#059669', '#047857', '#065F46'] },
  sunset: { gradients: ['#FF4E50', '#F9D423', '#FF5E62', '#E11D48'] },
  cyber: { gradients: ['#00F2FE', '#4FACFE', '#38BDF8', '#0284C7'] },
  coastal: { gradients: ['#3B82F6', '#06B6D4', '#2563EB', '#1E40AF'] },
  retro: { gradients: ['#D946EF', '#8B5CF6', '#F59E0B', '#FF0844'] },
  gold: { gradients: ['#B45309', '#D97706', '#FBBF24', '#FCD34D'] }
};

/**
 * Process Format A: Profile Picture Frame (1080x1080)
 */
export async function generateProfileFrame(photoBuffer, params) {
  const selectedStyle = params.style || 'emerald';
  const colors = themeColors[selectedStyle] || themeColors.emerald;
  const gradientStops = colors.gradients;

  // 1. Prepare user image with fine-tuning (zoom & pan) inside 1080x1080 canvas
  const processedUser = await processUserPhoto(photoBuffer, params, 1080, 1080, true);

  // 2. Create circular mask
  const circleMask = Buffer.from(
    `<svg width="1080" height="1080">
       <circle cx="540" cy="540" r="500" fill="white"/>
     </svg>`
  );

  // Apply circular mask to the user image
  const maskedUser = await sharp(processedUser)
    .composite([{
      input: circleMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // 3. Define the SVG overlay with style-specific gradient colors
  const overlaySvg = Buffer.from(
    `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="beachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="${gradientStops[0]}" />
           <stop offset="35%" stop-color="${gradientStops[1]}" />
           <stop offset="70%" stop-color="${gradientStops[2]}" />
           <stop offset="100%" stop-color="${gradientStops[3]}" />
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
       
       <!-- Decorative beach elements -->
       <path d="M120,400 Q80,500 130,600 Q180,500 120,400 Z" fill="url(#beachGrad)" opacity="0.8" />
       <path d="M960,400 Q1000,500 950,600 Q900,500 960,400 Z" fill="url(#beachGrad)" opacity="0.8" />
       
       <!-- Waves at the bottom -->
       <path d="M160,780 Q320,830 540,780 T920,780 L920,850 L160,850 Z" fill="url(#beachGrad)" opacity="0.25" />
       
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
 * Process Format B: Builder Card (1080x1350) - RECTANGULAR PHOTO & NO QR CODE & DYNAMIC SKILLS CAPSULES
 */
export async function generateBuilderCard(photoBuffer, details, params) {
  const { name, stack, builderTitle } = details;
  const escapedName = escapeXml(name).toUpperCase();
  const escapedTitle = escapeXml(builderTitle).toLowerCase(); // all lowercase as in attachment
  
  // Strict layout properties from the attachment
  const cardBorderColor = '#006B3F';
  const cardBgColor = '#F3F4F0';
  const highlightColor = '#FDE047';
  const bubbleColor = '#FDE047';
  const nameTextColor = '#000000';
  const subtextColor = '#4B5563';
  const quoteLine3Color = '#000000';

  // 1. Prepare user image with fine-tuning (zoom & pan) inside a 725x760 rectangle box (isFrame = false)
  const photoWidth = 725;
  const photoHeight = 760;
  const processedUserPhoto = await processUserPhoto(photoBuffer, params, photoWidth, photoHeight, false);

  // 2. Create rounded rectangle mask for the card photo (rx=32)
  const roundedMask = Buffer.from(
    `<svg width="${photoWidth}" height="${photoHeight}">
       <rect x="0" y="0" width="${photoWidth}" height="${photoHeight}" rx="32" ry="32" fill="white"/>
     </svg>`
  );

  // Apply rounded mask to the processed user photo
  const maskedUserPhoto = await sharp(processedUserPhoto)
    .composite([{
      input: roundedMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // 3. Create background image (1080x1350)
  const bgSvg = Buffer.from(
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
       <!-- Base background (cream color) -->
       <rect width="1080" height="1350" fill="${cardBgColor}" />
       
       <!-- Thick forest green badge border -->
       <rect x="12" y="12" width="1056" height="1326" rx="48" fill="none" stroke="${cardBorderColor}" stroke-width="24" />
       
       <!-- Fine black inner frame line -->
       <rect x="24" y="24" width="1032" height="1302" rx="36" fill="none" stroke="#000000" stroke-width="3" />
       
       <!-- Lanyard punch slot at the top center -->
       <rect x="490" y="30" width="100" height="24" rx="12" fill="#1E293B" stroke="#000000" stroke-width="3" />
     </svg>`
  );

  const backgroundBuffer = await sharp(bgSvg).png().toBuffer();

  // 4. Parse Stack string to build Left vertical skill column badges dynamically
  const skillList = stack.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const defaultSkills = ['Py', 'DB', 'JS', 'UI', 'Git', 'Go'];
  const skillsToRender = [];
  for (let i = 0; i < 6; i++) {
    if (i < skillList.length) {
      skillsToRender.push(skillList[i]);
    } else {
      skillsToRender.push(defaultSkills[i - skillList.length]);
    }
  }

  // Compile vertical skills circular pills SVG content - dynamically grows if text is long!
  let skillsSvg = '';
  for (let i = 0; i < 6; i++) {
    const skill = skillsToRender[i];
    const displaySkill = skill.toUpperCase();
    const y = 390 + (i * 110); 
    
    let fill = '#FFFFFF';
    let textColor = '#000000';
    
    if (i === 0) { fill = '#FDE047'; } 
    else if (i === 1) { fill = '#006B3F'; textColor = '#FFFFFF'; } 
    else if (i === 4) { fill = '#3B82F6'; textColor = '#FFFFFF'; } 

    // Dynamic width calculation so skills of any character length fit perfectly
    // 76px is standard diameter (circle). It grows into capsule up to 160px max width.
    const charWidth = 14;
    const badgeWidth = Math.min(160, Math.max(76, displaySkill.length * charWidth + 24));
    
    // Dynamically scale down font if text is longer
    const fontSize = displaySkill.length > 6 ? 16 : 22;
    
    skillsSvg += `
      <rect x="${92 - badgeWidth / 2}" y="${y - 38}" width="${badgeWidth}" height="76" rx="38" ry="38" fill="${fill}" stroke="#000000" stroke-width="3" />
      <text x="92" y="${y + 9}" font-family="'Outfit', system-ui, sans-serif" font-weight="900" font-size="${fontSize}" text-anchor="middle" fill="${textColor}">${escapeXml(displaySkill)}</text>
    `;
  }

  // 5. Create the card structure and text overlay SVG
  const cardOverlaySvg = Buffer.from(
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
       <!-- Top certified Goa badge speech bubble -->
       <path d="M 480,35 h 120 a 12,12 0 0 1 12,12 v 38 a 12,12 0 0 1 -12,12 h -45 l -15,14 l -15,-14 h -45 a 12,12 0 0 1 -12,-12 v -38 a 12,12 0 0 1 12,-12 Z" fill="${bubbleColor}" stroke="#000000" stroke-width="3.5" />
       <text x="540" y="82" font-family="'Outfit', 'Inter', system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#000000">गोवा</text>
       <text x="540" y="128" font-family="'Outfit', system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="2" text-anchor="middle" fill="#000000">certified</text>

       <!-- Main Builder Title (large, bold lowercase text with dot) -->
       <text x="540" y="205" fill="#000000" font-family="'Outfit', system-ui, sans-serif" font-size="64" font-weight="900" text-anchor="middle" letter-spacing="-1">${escapedTitle}.</text>

       <!-- Name marker highlight box -->
       <rect x="360" y="250" width="360" height="58" rx="8" fill="${highlightColor}" stroke="#000000" stroke-width="3" />
       <!-- Name centered text -->
       <text x="540" y="292" fill="${nameTextColor}" font-family="'Outfit', system-ui, sans-serif" font-size="32" font-weight="900" text-anchor="middle">${escapedName}</text>
       
       <!-- Event Subtitle -->
       <text x="540" y="342" fill="${subtextColor}" font-family="'Outfit', system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle">Builder @ HH Goa 2026</text>

       <!-- Vertical Skill circular pills -->
       ${skillsSvg}
       
       <!-- Tiny Sparkle Star decoration on the right border of photo container -->
       <path d="M 945,735 L 950,750 L 965,755 L 950,760 L 945,775 L 940,760 L 925,755 L 940,750 Z" fill="#F43F5E" stroke="#000000" stroke-width="3" />

       <!-- Bottom Left Text Tags (QR Code completely removed) -->
       <text x="50" y="1230" font-family="'Outfit', monospace" font-weight="900" font-size="20" fill="${cardBorderColor}">#FrameInGoa</text>
       <text x="50" y="1260" font-family="'Outfit', monospace" font-weight="900" font-size="20" fill="#64748B">hh-goa-2026</text>

       <!-- Bottom Right Quote (Ideas, sleep, Goa) -->
       <text x="945" y="1198" font-family="'Outfit', system-ui, sans-serif" font-weight="900" font-style="italic" font-size="24" text-anchor="end" fill="#374151">Ideas shipped,</text>
       <text x="945" y="1233" font-family="'Outfit', system-ui, sans-serif" font-weight="900" font-style="italic" font-size="24" text-anchor="end" fill="#374151">sleep skipped,</text>
       <text x="945" y="1268" font-family="'Outfit', system-ui, sans-serif" font-weight="900" font-style="italic" font-size="24" text-anchor="end" fill="${quoteLine3Color}">Goa lived.</text>
     </svg>`
  );

  // 7. Composite everything together
  return await sharp(backgroundBuffer)
    .composite([
      {
        input: maskedUserPhoto,
        top: 370,
        left: 200
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
