import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const base = path.join(__dirname, '..', 'public', 'images');
const lessonsDir = path.join(base, 'lessons');
if (!fs.existsSync(lessonsDir)) fs.mkdirSync(lessonsDir, { recursive: true });
const copies = [
  { src: 'speakers.png', dest: 'headphones.png' },
  { src: 'projector.png', dest: 'printer.png' },
  { src: 'phishing.png', dest: 'suspicious-link.png' },
  { src: 'monitor.png', dest: 'eye-break.png' },
  { src: 'computer.png', dest: 'clean-hands.png' },
  { src: 'computer.png', dest: 'good-posture.png' },
  { src: 'monitor.png', dest: 'shutdown.png' },
  { src: 'system-unit.png', dest: path.join('lessons', 'cpu.png') },
  { src: 'system-unit.png', dest: path.join('lessons', 'ram.png') },
  { src: 'system-unit.png', dest: path.join('lessons', 'motherboard.png') },
  { src: 'system-unit.png', dest: path.join('lessons', 'power-supply.png') },
  { src: 'system-unit.png', dest: path.join('lessons', 'gpu.png') },
  { src: 'system-unit.png', dest: path.join('lessons', 'cooling-fan.png') },
  { src: 'computer.png', dest: path.join('lessons', 'cable-care.png') },
  { src: 'phishing.png', dest: path.join('lessons', 'suspicious-link.png') },
  { src: 'monitor.png', dest: path.join('lessons', 'eye-break.png') },
];
for (const copy of copies) {
  const srcPath = path.join(base, copy.src);
  const destPath = path.join(base, copy.dest);
  if (!fs.existsSync(srcPath)) {
    console.warn('Missing source image:', srcPath);
    continue;
  }
  fs.copyFileSync(srcPath, destPath);
  console.log('Created', destPath);
}
console.log('Placeholder image copying complete.');
