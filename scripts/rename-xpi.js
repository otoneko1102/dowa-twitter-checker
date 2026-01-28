const fs = require('fs');
const path = require('path');
const dist = path.resolve(__dirname, '..', 'dist');

const files = fs.readdirSync(dist).filter(f => f.endsWith('.zip'));
if (files.length === 0) {
  console.error('No zip artifact found in dist/');
  process.exit(2);
}

for (const f of files) {
  const oldp = path.join(dist, f);
  const newp = path.join(dist, f.replace(/\.zip$/, '.xpi'));
  try {
    fs.copyFileSync(oldp, newp);
    console.log(`Copied ${oldp} → ${newp}`);
  } catch (e) {
    console.error('Failed to copy', e);
    process.exit(2);
  }
}
