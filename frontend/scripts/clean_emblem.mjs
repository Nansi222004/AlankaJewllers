import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const origPngPath = path.resolve('src/assets/logo-emblem.png');
  const { data, info } = await sharp(origPngPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Let's inspect known points in the inner background:
  const innerBgPoints = [
    { name: 'Below A loop', x: 370, y: 460 },
    { name: 'Inside A loop', x: 340, y: 360 },
    { name: 'Between A and J', x: 545, y: 240 },
    { name: 'Above A loop left', x: 260, y: 230 },
    { name: 'Right of J stem', x: 620, y: 330 },
    { name: 'Below J curve', x: 580, y: 520 },
    { name: 'Between bottom scroll and ring', x: 433, y: 580 }
  ];

  console.log('--- Inner Background Points ---');
  for (const pt of innerBgPoints) {
    const idx = (pt.y * width + pt.x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = max === 0 ? 0 : (max - min) / max;
    console.log(`${pt.name.padEnd(30)}: RGB=(${r},${g},${b}) A=${a} | diffRB=${r-b} diffRG=${r-g} diffGB=${g-b} S=${(s*100).toFixed(1)}%`);
  }

  // Let's inspect known gold points:
  const goldPoints = [
    { name: 'A loop left curve', x: 230, y: 350 },
    { name: 'A top crest highlight', x: 380, y: 300 },
    { name: 'A top white specular', x: 310, y: 280 },
    { name: 'A right diagonal', x: 480, y: 270 },
    { name: 'Diamond top face', x: 590, y: 160 },
    { name: 'Diamond facet line', x: 590, y: 175 },
    { name: 'J stem center', x: 580, y: 350 },
    { name: 'J bottom curve', x: 560, y: 480 },
    { name: 'Oval ring top', x: 433, y: 65 },
    { name: 'Oval ring bottom', x: 433, y: 535 },
    { name: 'Bottom teardrop jewel center', x: 433, y: 700 }
  ];

  console.log('\n--- Gold Points ---');
  for (const pt of goldPoints) {
    const idx = (pt.y * width + pt.x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = max === 0 ? 0 : (max - min) / max;
    console.log(`${pt.name.padEnd(30)}: RGB=(${r},${g},${b}) A=${a} | diffRB=${r-b} diffRG=${r-g} diffGB=${g-b} S=${(s*100).toFixed(1)}%`);
  }
}

main().catch(console.error);
