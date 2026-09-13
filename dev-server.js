const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const rootDir = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Optional: import api handlers
let datasetHandler = null;
let clinicalHandler = null;
try {
  datasetHandler = require('./api/dataset.js');
} catch (e) {}

try {
  clinicalHandler = require('./api/clinical-decision-support.js');
} catch (e) {}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. API: /api/dataset
  if (pathname === '/api/dataset') {
    if (datasetHandler) {
      // Mock Express req/res
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      return datasetHandler(req, res);
    } else {
      const dataPath = path.join(rootDir, 'data', 'debernardi_dataset.json');
      if (fs.existsSync(dataPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        fs.createReadStream(dataPath).pipe(res);
        return;
      }
    }
  }

  // 2. API: /api/clinical-decision-support
  if (pathname === '/api/clinical-decision-support') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }

      if (clinicalHandler) {
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        return clinicalHandler(req, res);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, report: 'Clinical Decision Support API active' }));
      }
    });
    return;
  }

  // 3. Routing & Rewrites
  // / -> index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // /qml or /qml/ -> /qml/index.html
  if (pathname === '/qml' || pathname === '/qml/') {
    pathname = '/qml/index.html';
  }

  // /assets/* rewrite to /qml/assets/* (Vercel cleanUrls compatibility)
  if (pathname.startsWith('/assets/')) {
    pathname = '/qml' + pathname;
  }

  let filePath = path.join(rootDir, decodeURIComponent(pathname));

  // If path is a directory, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Zero-404 Fallback: If requesting a missing .js or .css asset, serve the latest active bundle
  if (!fs.existsSync(filePath)) {
    const ext = path.extname(pathname).toLowerCase();
    const assetsDir = path.join(rootDir, 'qml', 'assets');
    if (fs.existsSync(assetsDir)) {
      if (ext === '.js' && (pathname.includes('/assets/') || pathname.includes('index-'))) {
        const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
        if (jsFiles.length > 0) {
          const fallbackJs = jsFiles.find(f => f.startsWith('index-')) || jsFiles[0];
          filePath = path.join(assetsDir, fallbackJs);
        }
      } else if (ext === '.css' && (pathname.includes('/assets/') || pathname.includes('index-'))) {
        const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
        if (cssFiles.length > 0) {
          const fallbackCss = cssFiles.find(f => f.startsWith('index-')) || cssFiles[0];
          filePath = path.join(assetsDir, fallbackCss);
        }
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    console.warn(`[${new Date().toLocaleTimeString()}] 404 Not Found: ${pathname}`);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + pathname);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  console.log(`[${new Date().toLocaleTimeString()}] 200 OK: ${pathname} -> ${path.basename(filePath)}`);
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`\n================================================================`);
  console.log(`  ONCOQUANTUM AI SUITE - LOCAL DEVELOPMENT SERVER`);
  console.log(`================================================================`);
  console.log(`  Portal URL:             http://localhost:${PORT}/`);
  console.log(`  OncoScan AI:            http://localhost:${PORT}/oncoscan.html`);
  console.log(`  QuantumPancreas AI:     http://localhost:${PORT}/qml/`);
  console.log(`  Clinical Dataset API:   http://localhost:${PORT}/api/dataset`);
  console.log(`================================================================\n`);
});
