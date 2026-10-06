import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateCleanEmblem() {
  const jpgPath = path.resolve('src/assets/logo.jpeg');
  
  // Crop the emblem tightly from logo.jpeg
  // The emblem spans left: 180, top: 90, width: 876, height: 742
  const cropLeft = 180;
  const cropTop = 90;
  const cropWidth = 876;
  const cropHeight = 742;

  const { data: rawRgb, info } = await sharp(jpgPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const rgba = Buffer.alloc(width * height * 4);

  // We need to determine alpha for each pixel: 0 (transparent paper/shadow) to 255 (solid gold)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 3;
      const dstIdx = (y * width + x) * 4;

      const r = rawRgb[srcIdx];
      const g = rawRgb[srcIdx + 1];
      const b = rawRgb[srcIdx + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sHsv = max === 0 ? 0 : (max - min) / max;
      const lRgb = (max + min) / 510;
      const diffRB = r - b;
      const diffRG = r - g;
      const diffGB = g - b;

      // 1. Definite Gold Specular Highlights (shiny metallic highlights on A, J, diamond, wreaths)
      const isSpecularGold = (r >= 246 && g >= 235 && lRgb > 0.85 && diffRB >= 20);

      // 2. Definite Gold Metal Midtones
      const isMidtoneGold = (diffRB >= 80 && sHsv >= 0.48) || (sHsv >= 0.65 && diffRB >= 55);

      // 3. Definite Deep Gold Engravings / Crevices
      // Blue is very low in dark gold (b <= 35), and saturation is very high (sHsv > 0.70)
      const isDeepGold = (r < 150 && b <= 40 && sHsv >= 0.65 && diffRB >= 35);

      // 4. Definite Paper Background & Ambient Drop Shadow
      // Paper background has sHsv <= 0.32, diffRB <= 60, and b is relatively high
      // Shadow on paper has b > 45 even when dark, and sHsv <= 0.42
      const isPaper = (sHsv <= 0.32 && diffRB <= 62) || 
                      (lRgb > 0.60 && sHsv <= 0.36 && diffRB <= 68);
      const isPaperShadow = (sHsv <= 0.42 && diffRB <= 72 && b >= 45 && !isDeepGold && !isSpecularGold);

      let alpha = 255;

      if (isPaper || isPaperShadow) {
        alpha = 0;
      } else if (isSpecularGold || isMidtoneGold || isDeepGold) {
        alpha = 255;
      } else {
        // Transition / Edge anti-aliasing zone
        // Smoothly interpolate alpha based on saturation and chroma warmth
        const satScore = (sHsv - 0.38) / (0.50 - 0.38); // 0 at 0.38, 1 at 0.50
        const chromaScore = (diffRB - 65) / (85 - 65);   // 0 at 65, 1 at 85
        const combinedScore = Math.max(0, Math.min(1, Math.max(satScore, chromaScore)));
        
        alpha = Math.round(combinedScore * 255);
      }

      // Special check: at the very bottom beneath the teardrop (y > 735), ensure separator line shadow is removed
      if (y > 735 && alpha > 0) {
        if (r < 100 || sHsv < 0.60) {
          alpha = 0;
        }
      }

      rgba[dstIdx] = r;
      rgba[dstIdx + 1] = g;
      rgba[dstIdx + 2] = b;
      rgba[dstIdx + 3] = alpha;
    }
  }

  // Create clean transparent PNG
  const cleanPngPath = path.resolve('C:/Users/nansi.KHUSHI/.gemini/antigravity-ide/brain/87128981-d33c-4615-b51a-43e9b830599e/clean_emblem_v1.png');
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(cleanPngPath);

  // Composite onto dark plum footer background (#352028)
  const plumCompPath = path.resolve('C:/Users/nansi.KHUSHI/.gemini/antigravity-ide/brain/87128981-d33c-4615-b51a-43e9b830599e/clean_emblem_on_plum.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 53, g: 32, b: 40, alpha: 1 } // #352028 brand-plum
    }
  })
    .composite([{ input: cleanPngPath }])
    .png()
    .toFile(plumCompPath);

  console.log('Saved clean_emblem_v1.png and clean_emblem_on_plum.png');
}

generateCleanEmblem().catch(console.error);
