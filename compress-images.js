import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, 'public', 'images', 'communities');
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));

for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(inputDir, file);
    
    await sharp(inputPath)
        .resize(400, 400, { fit: 'cover' })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(outputPath + '.tmp');
    
    fs.renameSync(outputPath + '.tmp', outputPath);
    console.log(`✓ ${file}`);
}

console.log('Done!');
