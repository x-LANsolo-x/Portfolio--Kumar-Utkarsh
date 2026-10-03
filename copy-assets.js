import fs from 'fs';
import path from 'path';

const folders = ['fonts', 'stickers', 'case', 'gallery', 'work'];
const files = ['sasha-logo.svg', 'robots.txt', 'sitemap.xml'];

for (const folder of folders) {
  const src = path.resolve(folder);
  const dest = path.resolve('dist', folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${folder} to dist/${folder}`);
  }
}

for (const file of files) {
  const src = path.resolve(file);
  const dest = path.resolve('dist', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/${file}`);
  }
}
