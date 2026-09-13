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

    const jsPath = jsMatch ? jsMatch[1] : './assets/index.js';
    const cssPath = cssMatch ? cssMatch[1] : './assets/index.css';

    // Remove crossorigin from stylesheet link (prevents CORS blocking on local/file protocols)
    html = html.replace(/<link\s+rel=["']stylesheet["']\s+crossorigin\s+href=["']([^"']+)["']>/i, '<link rel="stylesheet" href="$1">');

    // Ensure dual script loading: type="module" for modern browsers, nomodule defer for fallback
    const scriptReplacement = `<script type="module" crossorigin src="${jsPath}"></script>\n    <script nomodule defer src="${jsPath}"></script>`;
    html = html.replace(/<script\s+type=["']module["']\s+crossorigin\s+src=["'][^"']+["']><\/script>/i, scriptReplacement);
    html = html.replace(/<script\s+defer\s+src=["'][^"']+["']><\/script>/i, scriptReplacement);

    // Inject base path resolver for server URLs without trailing slash (/qml)
    if (!html.includes('window.location.pathname.endsWith(\'/qml\')')) {
      const baseScript = `
    <script>
      (function() {
        if (window.location.pathname && (window.location.pathname.endsWith('/qml') || window.location.pathname.endsWith('/qml/'))) {
          var base = document.createElement('base');
          base.href = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
          document.head.appendChild(base);
        }
      })();
    </script>`;
      html = html.replace('<head>', '<head>' + baseScript);
    }

    // Inject resilience error boundary & cache clear helper
    const recoveryScript = `
    <script>
      window.addEventListener('error', function(e) {
        console.warn('Initialization notice:', e.message);
        setTimeout(function() {
          var root = document.getElementById('root');
          if (root && root.querySelector('#loading-screen')) {
            var loader = document.getElementById('loading-screen');
            if (loader) {
              loader.innerHTML = '<div class="q-spinner"></div>' +
                '<div style="font-size: 16px; font-weight: 600; color: #38bdf8; margin-top: 8px;">QuantumPancreas AI Platform</div>' +
                '<div style="font-size: 13px; color: #94a3b8; max-width: 420px; line-height: 1.5; margin: 8px 0 16px;">Biomarker engine is initializing. If this takes longer than expected, browser cache may need to be refreshed.</div>' +
                '<div style="display: flex; gap: 10px;">' +
                  '<button onclick="window.location.reload(true)" style="background: #06b6d4; color: #070b14; font-weight: 700; font-size: 13px; padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer;">Force Refresh (Clear Cache)</button>' +
                  '<a href="../index.html" style="color: #94a3b8; text-decoration: none; font-size: 13px; padding: 8px 14px; border-radius: 8px; border: 1px solid #334155; display: inline-flex; align-items: center;">Suite Portal &rarr;</a>' +
                '</div>';
            }
          }
        }, 3000);
      });
    </script>`;
    if (!html.includes('Force Refresh (Clear Cache)')) {
      html = html.replace('</head>', recoveryScript + '\n  </head>');
    }

    fs.writeFileSync(qmlIndexHtmlPath, html);
    console.log('✓ Post-processed qml/index.html with resilient dual script loaders & recovery handler.');

    // 4. Create alias copies of the compiled assets so older cached HTML hashes never 404
    const assetsDir = path.join(projectRoot, 'qml', 'assets');
    if (fs.existsSync(assetsDir) && jsMatch && cssMatch) {
      const activeJsFile = path.basename(jsMatch[1]);
      const activeCssFile = path.basename(cssMatch[1]);
      const activeJsFullPath = path.join(assetsDir, activeJsFile);
      const activeCssFullPath = path.join(assetsDir, activeCssFile);

      const legacyJsAliases = ['index.js', 'index-DH5Lw7Zh.js', 'index-BHNNrSaa.js', 'index-CLCyivgx.js'];
      const legacyCssAliases = ['index.css', 'index-1Ert2ZfF.css', 'index-BLc9p4tu.css', 'index-BljPVjzh.css'];

      legacyJsAliases.forEach(alias => {
        const dest = path.join(assetsDir, alias);
        if (dest !== activeJsFullPath) {
          try { fs.copyFileSync(activeJsFullPath, dest); } catch (e) {}
        }
      });

      legacyCssAliases.forEach(alias => {
        const dest = path.join(assetsDir, alias);
        if (dest !== activeCssFullPath) {
          try { fs.copyFileSync(activeCssFullPath, dest); } catch (e) {}
        }
      });
      console.log('✓ Synchronized legacy asset cache aliases for zero-404 resilience.');
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
  const apiDir = path.join(projectRoot, 'api');
  const qmlApiDir = path.join(projectRoot, 'qml', 'api');

  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  if (!fs.existsSync(qmlApiDir)) fs.mkdirSync(qmlApiDir, { recursive: true });

  fs.writeFileSync(path.join(apiDir, 'dataset.json'), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(qmlApiDir, 'dataset'), JSON.stringify(payload));
  console.log(`✓ Synchronized ${data.length} clinical benchmark records.`);
}

console.log('=== Build Complete: OncoQuantum AI Suite is production-ready! ===');
