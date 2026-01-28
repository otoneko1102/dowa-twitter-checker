const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/package.js <chrome|firefox>');
  process.exit(2);
}

const distDir = path.resolve(__dirname, '..', 'dist');
const source = path.join(distDir, target);
if (!fs.existsSync(source)) {
  console.error('Source folder does not exist:', source);
  process.exit(2);
}

const outPath = path.join(distDir, `${target}.zip`);
const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`${outPath} created (${archive.pointer()} total bytes)`);
});
archive.on('error', (err) => { throw err; });
archive.pipe(output);
archive.directory(source, false);
archive.finalize();
