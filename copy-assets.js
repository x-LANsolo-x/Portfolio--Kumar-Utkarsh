import fs from 'fs';
import path from 'path';

const folders = ['fonts', 'stickers', 'case', 'gallery', 'work'];

for (const folder of folders) {
  const src = path.resolve(folder);
  const dest = path.resolve('dist', folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${folder} to dist/${folder}`);
  }
}
