/**
 * Client-Side HTML5 Canvas Renderer
 * Provides instant, zero-latency image synthesis directly in the browser as a fallback or primary engine.
 */

// Helper to load an image from File, Blob, or URL
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load user image into Canvas'));
    
    if (src instanceof File || src instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      reader.readAsDataURL(src);
    } else {
      img.src = src;
    }
  });
};

// Helper to draw rounded rectangle on Canvas
function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
  let r = radius;
  if (typeof r === 'number') {
    r = { tl: r, tr: r, br: r, bl: r };
  } else {
    r = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, r);
  }
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Render Format B: Builder Card (1080x1350)
 */
export async function renderBuilderCardOnCanvas(fileOrUrl, details, params = {}) {
  const { name = 'BUILDER', stack = 'JS, React, Node', builderTitle = 'builder' } = details;
  const { zoom = 1.0, panX = 0, panY = 0, brightness = 100, filter = 'normal' } = params;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  // 1. Base Cream Background
  ctx.fillStyle = '#F3F4F0';
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Thick Forest Green Card Border
  ctx.lineWidth = 24;
  ctx.strokeStyle = '#006B3F';
  roundRect(ctx, 12, 12, 1056, 1326, 48, false, true);

  // 3. Fine Inner Black Frame Line
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  roundRect(ctx, 24, 24, 1032, 1302, 36, false, true);

  // 4. Lanyard slot punch hole
  ctx.fillStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  roundRect(ctx, 490, 30, 100, 24, 12, true, true);

  // 5. Draw Certified Goa speech bubble badge
  ctx.save();
  ctx.fillStyle = '#FDE047';
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(480, 35);
  ctx.lineTo(600, 35);
  ctx.arcTo(612, 35, 612, 47, 12);
  ctx.lineTo(612, 85);
  ctx.arcTo(612, 97, 600, 97, 12);
  ctx.lineTo(555, 97);
  ctx.lineTo(540, 111);
  ctx.lineTo(525, 97);
  ctx.lineTo(480, 97);
  ctx.arcTo(468, 97, 468, 85, 12);
  ctx.lineTo(468, 47);
  ctx.arcTo(468, 35, 480, 35, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Certified bubble text
  ctx.fillStyle = '#000000';
  ctx.font = '900 32px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', 540, 80);

  ctx.font = '800 16px "Outfit", sans-serif';
  ctx.fillText('certified', 540, 128);
  ctx.restore();

  // 6. Main Builder Title
  ctx.fillStyle = '#000000';
  ctx.font = '900 60px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  const cleanTitle = (builderTitle || 'builder').toLowerCase().replace(/\.+$/, '') + '.';
  ctx.fillText(cleanTitle, 540, 205);

  // 7. Name Marker Box + Text
  ctx.fillStyle = '#FDE047';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  roundRect(ctx, 360, 250, 360, 58, 8, true, true);

  ctx.fillStyle = '#000000';
  ctx.font = '900 30px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((name || 'BUILDER').toUpperCase(), 540, 290);

  // 8. Event Subtitle
  ctx.fillStyle = '#4B5563';
  ctx.font = '800 20px "Outfit", sans-serif';
  ctx.fillText('Builder @ HH Goa 2026', 540, 342);

  // 9. Render User Photo Container with rounded corners
  const photoX = 200;
  const photoY = 370;
  const photoW = 725;
  const photoH = 760;

  ctx.save();
  // Clip to rounded photo container
  roundRect(ctx, photoX, photoY, photoW, photoH, 32);
  ctx.clip();

  // Fill default photo background
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // Load and draw photo
  try {
    const userImg = await loadImage(fileOrUrl);
    const origW = userImg.width || 500;
    const origH = userImg.height || 500;
    
    // Fit-to-contain base scale
    const baseScale = Math.min(photoW / origW, photoH / origH);
    const finalScale = (baseScale * zoom) || baseScale;
    
    const drawW = origW * finalScale;
    const drawH = origH * finalScale;
    
    const drawX = photoX + (photoW - drawW) / 2 + (panX || 0);
    const drawY = photoY + (photoH - drawH) / 2 + (panY || 0);

    // Apply Filter & Brightness
    let filterString = `brightness(${brightness}%)`;
    const f = (filter || '').toLowerCase();
    if (f === 'grayscale') filterString += ' grayscale(100%)';
    else if (f === 'sepia') filterString += ' sepia(100%)';
    else if (f === 'cool') filterString += ' hue-rotate(30deg) saturate(125%)';
    else if (f === 'warm') filterString += ' hue-rotate(-30deg) saturate(125%)';

    ctx.filter = filterString;
    ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
    ctx.filter = 'none';
  } catch (imgErr) {
    console.error('Failed to draw user photo on canvas:', imgErr);
  }
  ctx.restore();

  // 10. Left Vertical Skill Badges
  const skillList = (stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const defaultSkills = ['Py', 'DB', 'JS', 'UI', 'Git', 'Go'];
  const skillsToRender = [];
  for (let i = 0; i < 6; i++) {
    skillsToRender.push(i < skillList.length ? skillList[i] : defaultSkills[i - skillList.length]);
  }

  for (let i = 0; i < 6; i++) {
    const skill = skillsToRender[i].toUpperCase();
    const y = 390 + i * 110;
    let fill = '#FFFFFF';
    let textColor = '#000000';

    if (i === 0) fill = '#FDE047';
    else if (i === 1) { fill = '#006B3F'; textColor = '#FFFFFF'; }
    else if (i === 4) { fill = '#3B82F6'; textColor = '#FFFFFF'; }

    const charWidth = 14;
    const badgeWidth = Math.min(160, Math.max(76, skill.length * charWidth + 24));
    const fontSize = skill.length > 6 ? 16 : 22;

    ctx.fillStyle = fill;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    roundRect(ctx, 92 - badgeWidth / 2, y - 38, badgeWidth, 76, 38, true, true);

    ctx.fillStyle = textColor;
    ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skill, 92, y);
    ctx.textBaseline = 'alphabetic';
  }

  // 11. Tiny Sparkle Star
  ctx.save();
  ctx.fillStyle = '#F43F5E';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(945, 735);
  ctx.lineTo(950, 750);
  ctx.lineTo(965, 755);
  ctx.lineTo(950, 760);
  ctx.lineTo(945, 775);
  ctx.lineTo(940, 760);
  ctx.lineTo(925, 755);
  ctx.lineTo(940, 750);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 12. Bottom Left Tags
  ctx.fillStyle = '#006B3F';
  ctx.font = '900 20px "Outfit", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('#FrameInGoa', 50, 1230);

  ctx.fillStyle = '#64748B';
  ctx.fillText('hh-goa-2026', 50, 1260);

  // 13. Bottom Right Italic Quote
  ctx.textAlign = 'right';
  ctx.font = 'italic 900 24px "Outfit", sans-serif';
  ctx.fillStyle = '#374151';
  ctx.fillText('Ideas shipped,', 945, 1198);
  ctx.fillText('sleep skipped,', 945, 1233);
  ctx.fillStyle = '#000000';
  ctx.fillText('Goa lived.', 945, 1268);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Render Format A: Profile Picture Frame (1080x1080)
 */
export async function renderProfileFrameOnCanvas(fileOrUrl, params = {}) {
  const { zoom = 1.0, panX = 0, panY = 0, brightness = 100, filter = 'normal', style = 'emerald' } = params;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Circular Mask for user photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 540, 500, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw user image
  try {
    const userImg = await loadImage(fileOrUrl);
    const origW = userImg.width || 500;
    const origH = userImg.height || 500;
    
    const baseScale = Math.min(1080 / origW, 1080 / origH);
    const finalScale = (baseScale * zoom) || baseScale;
    
    const drawW = origW * finalScale;
    const drawH = origH * finalScale;
    
    const drawX = (1080 - drawW) / 2 + (panX || 0);
    const drawY = (1080 - drawH) / 2 + (panY || 0);

    let filterString = `brightness(${brightness}%)`;
    const f = (filter || '').toLowerCase();
    if (f === 'grayscale') filterString += ' grayscale(100%)';
    else if (f === 'sepia') filterString += ' sepia(100%)';
    else if (f === 'cool') filterString += ' hue-rotate(30deg) saturate(125%)';
    else if (f === 'warm') filterString += ' hue-rotate(-30deg) saturate(125%)';

    ctx.filter = filterString;
    ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
    ctx.filter = 'none';
  } catch (err) {
    console.error('Failed to draw PFP user image on canvas:', err);
  }
  ctx.restore();

  // Theme Gradients
  const themeColors = {
    emerald: ['#10B981', '#059669', '#047857', '#065F46'],
    sunset: ['#FF4E50', '#F9D423', '#FF5E62', '#E11D48'],
    cyber: ['#00F2FE', '#4FACFE', '#38BDF8', '#0284C7'],
    coastal: ['#3B82F6', '#06B6D4', '#2563EB', '#1E40AF'],
    retro: ['#D946EF', '#8B5CF6', '#F59E0B', '#FF0844'],
    gold: ['#B45309', '#D97706', '#FBBF24', '#FCD34D']
  };
  const colors = themeColors[style] || themeColors.emerald;

  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.35, colors[1]);
  grad.addColorStop(0.7, colors[2]);
  grad.addColorStop(1, colors[3]);

  // Outer circular glowing frame
  ctx.lineWidth = 20;
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(540, 540, 500, 0, Math.PI * 2);
  ctx.stroke();

  // Top Builder Badge Pill
  ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = grad;
  roundRect(ctx, 440, 66, 200, 42, 21, true, true);

  ctx.fillStyle = '#EAB308';
  ctx.font = '800 16px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDER', 540, 92);

  // Bottom HH GOA 2026 Banner
  ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
  ctx.lineWidth = 4;
  ctx.strokeStyle = grad;
  roundRect(ctx, 340, 910, 400, 76, 38, true, true);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026', 540, 958);

  return canvas.toDataURL('image/png', 1.0);
}
