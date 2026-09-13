/**
 * bg-animation.js
 * OncoQuantum & Genomic Particle Entanglement Canvas Engine + Quantum Biosensing Cursor
 * 
 * Features:
 * - Entangled Qubit & Biomarker Canvas (Cyan, Indigo, Violet, Emerald, Rose)
 * - Scientific Glyphs (|0⟩, |1⟩, |ψ⟩, KRAS, BRCA1, LYVE1, REG1B, TFF1, G12D, TP53, EGFR, CA19-9)
 * - Microscopic Orbitals with Satellite Qubits
 * - Soft Fluid Mouse Repulsion
 * - High-Tech Quantum Biosensing Cursor (Precision Laser Dot, Orbital Ring, Particle Trail, Wave Collapse on Click)
 * - High-performance 60fps with Zero External Dependencies
 */

/* ==========================================================================
   PART 1: QUANTUM & GENOMIC PARTICLES ENTANGLEMENT CANVAS
   ========================================================================== */
function initQuantumGenomicBackground() {
  const canvas = document.getElementById('quantum-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const maxDistance = 140;
  const mouse = { x: null, y: null, radius: 160 };

  // Clinical oncology biomarkers & quantum states matching platform content
  const biomarkers = [
    '|0⟩', '|1⟩', '|ψ⟩', 'KRAS', 'BRCA1', 
    'LYVE1', 'REG1B', 'TFF1', 'G12D', 'TP53', 'EGFR', 'CA19-9'
  ];

  // Curated clinical palette
  const palette = [
    { r: 34, g: 211, b: 238, color: '#22d3ee' },  // Cyan (QML & Hilbert space)
    { r: 129, g: 140, b: 248, color: '#818cf8' }, // Indigo (Quantum Circuit)
    { r: 168, g: 85, b: 247, color: '#a855f7' }, // Violet (PDAC & Entanglement)
    { r: 52, g: 211, b: 153, color: '#34d399' }, // Emerald (Normal Tissue Baseline)
    { r: 251, g: 113, b: 133, color: '#fb7185' } // Rose (Oncogenic Mutation / BRCA)
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  class QuantumParticle {
    constructor(isGlyph = false) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.baseRadius = isGlyph ? 3.8 : Math.random() * 2.0 + 1.2;
      this.radius = this.baseRadius;
      this.theme = palette[Math.floor(Math.random() * palette.length)];
      this.isGlyph = isGlyph;
      this.glyph = isGlyph ? biomarkers[Math.floor(Math.random() * biomarkers.length)] : null;
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = Math.random() * 0.02 + 0.008;
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (Math.random() - 0.5) * 0.03;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.phaseSpeed;
      this.orbitAngle += this.orbitSpeed;

      // Smooth boundary wrapping
      if (this.x < -30) this.x = width + 30;
      if (this.x > width + 30) this.x = -30;
      if (this.y < -30) this.y = height + 30;
      if (this.y > height + 30) this.y = -30;

      // Interactive elastic mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force;
          this.y += Math.sin(angle) * force;
        }
      }
    }

    draw() {
      const pulse = Math.sin(this.phase) * 0.35 + 0.65;
      ctx.save();

      // Node center
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.85})`;
      ctx.shadowColor = this.theme.color;
      ctx.shadowBlur = this.isGlyph ? 14 : 6;
      ctx.fill();

      // Special orbital qubit rings on scientific biomarker nodes
      if (this.isGlyph) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, 0.22)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 16, 7, this.orbitAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Satellite orbiting particle
        const satX = this.x + Math.cos(this.orbitAngle) * 16;
        const satY = this.y + Math.sin(this.orbitAngle) * 7;
        ctx.beginPath();
        ctx.arc(satX, satY, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, 0.9)`;
        ctx.fill();

        // Text label
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, 0.6)`;
        ctx.fillText(this.glyph, this.x + 9, this.y - 7);
      }
      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 21000), 65);
    for (let i = 0; i < count; i++) {
      particles.push(new QuantumParticle(i % 5 === 0));
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.18;
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p1.theme.r}, ${p1.theme.g}, ${p1.theme.b}, ${alpha})`);
          grad.addColorStop(1, `rgba(${p2.theme.r}, ${p2.theme.g}, ${p2.theme.b}, ${alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  animate();
}

/* ==========================================================================
   PART 2: QUANTUM BIOSENSING INTERACTIVE CURSOR ENGINE
   ========================================================================== */
function initQuantumCursor() {
  // Only enable on non-touch pointer devices
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (document.getElementById('quantum-cursor-dot')) return;

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'quantum-cursor-styles';
  style.textContent = `
    .q-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22d3ee;
      box-shadow: 0 0 10px #22d3ee, 0 0 18px rgba(34, 211, 238, 0.7);
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), 
                  height 0.2s cubic-bezier(0.16, 1, 0.3, 1), 
                  background-color 0.2s ease,
                  opacity 0.2s ease;
      opacity: 0;
    }

    .q-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid rgba(34, 211, 238, 0.45);
      box-shadow: 0 0 16px rgba(34, 211, 238, 0.2), inset 0 0 8px rgba(139, 92, 246, 0.15);
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      transition: width 0.26s cubic-bezier(0.16, 1, 0.3, 1), 
                  height 0.26s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.24s ease, 
                  box-shadow 0.24s ease,
                  opacity 0.2s ease;
      opacity: 0;
      backdrop-filter: blur(1px);
    }

    /* Orbital qubit nodes on halo */
    .q-cursor-ring::before,
    .q-cursor-ring::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 6px #38bdf8;
      transition: background-color 0.2s ease;
    }
    .q-cursor-ring::before {
      top: -2.5px;
      left: 50%;
      transform: translateX(-50%);
    }
    .q-cursor-ring::after {
      bottom: -2.5px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Hovering state over interactive elements */
    .q-cursor-ring.hovering {
      width: 54px;
      height: 54px;
      border-color: rgba(168, 85, 247, 0.85);
      box-shadow: 0 0 22px rgba(168, 85, 247, 0.5), inset 0 0 14px rgba(6, 182, 212, 0.25);
    }
    .q-cursor-ring.hovering::before,
    .q-cursor-ring.hovering::after {
      background: #c084fc;
      box-shadow: 0 0 8px #c084fc;
    }

    .q-cursor-dot.hovering {
      width: 9px;
      height: 9px;
      background: #ffffff;
      box-shadow: 0 0 14px #ffffff, 0 0 22px #c084fc;
    }

    /* Clicking wave collapse */
    .q-cursor-click-wave {
      position: fixed;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1.5px solid #38bdf8;
      pointer-events: none;
      z-index: 999997;
      transform: translate(-50%, -50%) scale(1);
      animation: qWaveCollapse 0.55s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }

    @keyframes qWaveCollapse {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.9;
        border-color: #22d3ee;
      }
      100% {
        transform: translate(-50%, -50%) scale(2.8);
        opacity: 0;
        border-color: #a855f7;
      }
    }

    /* Floating quantum particle trail */
    .q-cursor-spark {
      position: fixed;
      top: 0;
      left: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999996;
      transform: translate(-50%, -50%);
      animation: qSparkFade 0.5s ease-out forwards;
    }

    @keyframes qSparkFade {
      0% {
        opacity: 0.85;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2);
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Create DOM Elements
  const dot = document.createElement('div');
  dot.id = 'quantum-cursor-dot';
  dot.className = 'q-cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.id = 'quantum-cursor-ring';
  ring.className = 'q-cursor-ring';
  document.body.appendChild(ring);

  // Position tracking
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let ringAngle = 0;
  let isVisible = false;
  let lastSparkTime = 0;

  const sparkColors = ['#22d3ee', '#818cf8', '#a855f7', '#34d399', '#fb7185'];

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
    }

    // Direct dot positioning
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Emit quantum spark trail (throttled)
    const now = performance.now();
    if (now - lastSparkTime > 32) {
      lastSparkTime = now;
      createSpark(mouseX, mouseY);
    }
  });

  window.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  window.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  // Click Wave Collapse
  window.addEventListener('mousedown', (e) => {
    const wave = document.createElement('div');
    wave.className = 'q-cursor-click-wave';
    wave.style.left = `${e.clientX}px`;
    wave.style.top = `${e.clientY}px`;
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 550);
  });

  // Interactive Hover Detection (Delegated)
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .platform-card, .btn-launch-primary, .chip-badge, .status-pill, .sample-pill-container, tr, .tab-btn');
    if (target) {
      ring.classList.add('hovering');
      dot.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .platform-card, .btn-launch-primary, .chip-badge, .status-pill, .sample-pill-container, tr, .tab-btn');
    if (target) {
      ring.classList.remove('hovering');
      dot.classList.remove('hovering');
    }
  });

  // Spark Generator
  function createSpark(x, y) {
    const spark = document.createElement('div');
    spark.className = 'q-cursor-spark';
    const size = Math.random() * 2.5 + 1.5;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;

    const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.backgroundColor = color;
    spark.style.boxShadow = `0 0 6px ${color}`;

    // Random drift direction
    const dx = (Math.random() - 0.5) * 22;
    const dy = (Math.random() - 0.5) * 22;
    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 500);
  }

  // Smooth Ring Follow Loop (Lerp + continuous spin)
  function renderCursor() {
    if (isVisible) {
      // Easing / Lerp factor: 0.18
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ringAngle += 0.025; // Gentle slow rotation

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${ringAngle}rad)`;
    }
    requestAnimationFrame(renderCursor);
  }

  renderCursor();
}

/* ==========================================================================
   INITIALIZATION BOOTSTRAPPER
   ========================================================================== */
function initAllOncoQuantumFX() {
  initQuantumGenomicBackground();
  initQuantumCursor();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAllOncoQuantumFX);
} else {
  initAllOncoQuantumFX();
}
