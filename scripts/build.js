const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== Building OncoQuantum AI Suite for Production ===');

const projectRoot = path.resolve(__dirname, '..');
const reactAppDir = path.join(projectRoot, 'Hybrid-QML-Pancreatic-Cancer-Platform-main', 'Hybrid-QML-Pancreatic-Cancer-Platform-main');

console.log('1. Compiling QuantumPancreas React + Vite App into qml/...');
try {
  execSync('npm run build', { cwd: reactAppDir, stdio: 'inherit' });
  console.log('✓ Successfully compiled Hybrid QML platform to qml/');
} catch (err) {
  console.error('Failed to compile React app:', err.message);
  process.exit(1);
}

console.log('2. Syncing API datasets...');
const csvPath = path.join(reactAppDir, 'debernardi_dataset.csv');
if (fs.existsSync(csvPath)) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const record = {};
    headers.forEach((h, i) => {
      const val = values[i];
      record[h] = isNaN(Number(val)) ? val : Number(val);
    });
    return record;
  });

  const payload = { success: true, count: data.length, data };
  const apiDir = path.join(projectRoot, 'api');
  const qmlApiDir = path.join(projectRoot, 'qml', 'api');

  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  if (!fs.existsSync(qmlApiDir)) fs.mkdirSync(qmlApiDir, { recursive: true });

  fs.writeFileSync(path.join(apiDir, 'dataset.json'), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(qmlApiDir, 'dataset'), JSON.stringify(payload));
  console.log(`✓ Synchronized ${data.length} clinical benchmark records.`);
}

console.log('=== Build Complete: OncoQuantum AI Suite is production-ready! ===');
