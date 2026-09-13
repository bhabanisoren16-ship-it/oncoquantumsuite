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

  // Post-process qml/index.html for universal file://, Vercel, and local web server compatibility
  const qmlIndexHtmlPath = path.join(projectRoot, 'qml', 'index.html');
  if (fs.existsSync(qmlIndexHtmlPath)) {
    let html = fs.readFileSync(qmlIndexHtmlPath, 'utf-8');

    // Find compiled script and style paths
    const jsMatch = html.match(/src=["'](\.\/assets\/index-[^"']+\.js)["']/i) || 
                    html.match(/src=["'](\.\/assets\/[^"']+\.js)["']/i);
    const cssMatch = html.match(/href=["'](\.\/assets\/index-[^"']+\.css)["']/i) ||
                     html.match(/href=["'](\.\/assets\/[^"']+\.css)["']/i);

    const jsFile = jsMatch ? path.basename(jsMatch[1]) : 'index.js';
    const cssFile = cssMatch ? path.basename(cssMatch[1]) : 'index.css';

    // Construct Universal Single-File Compatible HTML
    html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hybrid QML Pancreatic Cancer Platform</title>
    <meta name="description" content="A hybrid quantum-classical machine learning platform for early pancreatic cancer detection using urinary biomarkers, PennyLane 4-qubit quantum simulator, classical benchmarks, and Gemini clinical decision support." />
    <meta property="og:title" content="Hybrid QML Pancreatic Cancer Platform" />
    <meta property="og:description" content="A hybrid quantum-classical machine learning platform for early pancreatic cancer detection using urinary biomarkers, PennyLane 4-qubit quantum simulator, classical benchmarks, and Gemini clinical decision support." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background-color: #070b14;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      #loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 16px;
        background-color: #070b14;
      }
      .q-spinner {
        width: 44px;
        height: 44px;
        border: 3px solid rgba(34, 211, 238, 0.2);
        border-top-color: #22d3ee;
        border-radius: 50%;
        animation: q-spin 0.8s linear infinite;
      }
      @keyframes q-spin {
        to { transform: rotate(360deg); }
      }
    </style>

    <!-- Universal Dual-Path Resolver: Works seamlessly on file://, /qml, /qml/, and subpaths -->
    <script>
      (function() {
        var isFile = window.location.protocol === 'file:';
        var isRoot = !window.location.pathname.includes('/qml');
        var assetPrefix = isFile ? './assets/' : (isRoot ? '/assets/' : '/qml/assets/');

        // 1. Inject Stylesheet without CORS requirement
        var cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = assetPrefix + '${cssFile}';
        cssLink.onerror = function() {
          // Fallback to relative path if absolute failed
          if (cssLink.href !== './assets/${cssFile}') {
            var fb = document.createElement('link');
            fb.rel = 'stylesheet';
            fb.href = './assets/${cssFile}';
            document.head.appendChild(fb);
          }
        };
        document.head.appendChild(cssLink);

        // 2. Inject Script with classic defer (runs on file:// without CORS rejection & on all servers)
        var appScript = document.createElement('script');
        appScript.defer = true;
        appScript.src = assetPrefix + '${jsFile}';
        appScript.onerror = function() {
          // Fallback to relative path if absolute failed
          if (appScript.src !== './assets/${jsFile}') {
            var fb = document.createElement('script');
            fb.defer = true;
            fb.src = './assets/${jsFile}';
            document.head.appendChild(fb);
          }
        };
        document.head.appendChild(appScript);
      })();
    </script>
  </head>
  <body>
    <div id="root">
      <div id="loading-screen">
        <div class="q-spinner"></div>
        <div style="font-size: 15px; font-weight: 600; color: #38bdf8; letter-spacing: 0.5px;">Initializing QuantumPancreas AI Platform...</div>
        <div style="font-size: 12px; color: #64748b;">Loading 4-Qubit Variational Ansatz & Biomarker Engine</div>
      </div>
    </div>
  </body>
</html>`;

    fs.writeFileSync(qmlIndexHtmlPath, html);
    console.log('✓ Post-processed qml/index.html with bulletproof universal loader.');

    // Also write a copy to root as qml.html for instant root-level routing
    fs.writeFileSync(path.join(projectRoot, 'qml.html'), html);
    console.log('✓ Synchronized root-level qml.html fallback.');

    // 3. Create alias copies of the compiled assets in BOTH qml/assets and root assets/
    const qmlAssetsDir = path.join(projectRoot, 'qml', 'assets');
    const rootAssetsDir = path.join(projectRoot, 'assets');

    if (!fs.existsSync(rootAssetsDir)) fs.mkdirSync(rootAssetsDir, { recursive: true });

    if (fs.existsSync(qmlAssetsDir) && jsMatch && cssMatch) {
      const activeJsFullPath = path.join(qmlAssetsDir, jsFile);
      const activeCssFullPath = path.join(qmlAssetsDir, cssFile);

      const legacyJsAliases = ['index.js', 'index-DH5Lw7Zh.js', 'index-BHNNrSaa.js', 'index-CLCyivgx.js', jsFile];
      const legacyCssAliases = ['index.css', 'index-1Ert2ZfF.css', 'index-BLc9p4tu.css', 'index-BljPVjzh.css', cssFile];

      legacyJsAliases.forEach(alias => {
        // Copy into qml/assets
        const destQml = path.join(qmlAssetsDir, alias);
        if (destQml !== activeJsFullPath) {
          try { fs.copyFileSync(activeJsFullPath, destQml); } catch (e) {}
        }
        // Copy into root assets/
        const destRoot = path.join(rootAssetsDir, alias);
        try { fs.copyFileSync(activeJsFullPath, destRoot); } catch (e) {}
      });

      legacyCssAliases.forEach(alias => {
        // Copy into qml/assets
        const destQml = path.join(qmlAssetsDir, alias);
        if (destQml !== activeCssFullPath) {
          try { fs.copyFileSync(activeCssFullPath, destQml); } catch (e) {}
        }
        // Copy into root assets/
        const destRoot = path.join(rootAssetsDir, alias);
        try { fs.copyFileSync(activeCssFullPath, destRoot); } catch (e) {}
      });

      console.log('✓ Synchronized dual-directory assets (qml/assets & assets/) with zero-404 alias matrix.');
    }
  }
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
  const dataDir = path.join(projectRoot, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'debernardi_dataset.json'), JSON.stringify(payload, null, 2));

  // Ensure api directory has NO non-js files that break Vercel serverless functions
  const rogueJson = path.join(projectRoot, 'api', 'dataset.json');
  if (fs.existsSync(rogueJson)) fs.unlinkSync(rogueJson);
  const rogueQmlApi = path.join(projectRoot, 'qml', 'api');
  if (fs.existsSync(rogueQmlApi)) fs.rmSync(rogueQmlApi, { recursive: true, force: true });

  console.log(`✓ Synchronized ${data.length} clinical benchmark records into data/debernardi_dataset.json.`);
}

console.log('=== Build Complete: OncoQuantum AI Suite is production-ready! ===');
