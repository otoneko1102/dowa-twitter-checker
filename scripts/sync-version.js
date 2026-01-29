const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const manifests = [
  path.join(root, 'src', 'manifest.json'),
  path.join(root, 'src', 'manifest.firefox.json')
];

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (e) {
  console.error('Failed to read package.json:', e.message || e);
  process.exit(1);
}

const version = pkg.version;
if (!version) {
  console.error('No version field found in package.json');
  process.exit(1);
}

for (const m of manifests) {
  if (!fs.existsSync(m)) {
    console.warn('Skipping missing manifest:', path.relative(root, m));
    continue;
  }
  try {
    const data = fs.readFileSync(m, 'utf8');
    const json = JSON.parse(data);
    json.version = version;
    fs.writeFileSync(m, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`Updated ${path.relative(root, m)} → version ${version}`);
  } catch (e) {
    console.error('Failed to update manifest', path.relative(root, m), e.message || e);
    process.exit(1);
  }
}
