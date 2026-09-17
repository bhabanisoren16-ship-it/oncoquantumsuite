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
  const maxDistance = 155;
  const mouse = { x: null, y: null, radius: 150 };

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
      this.vx = (Math.random() - 0.5) * 0.40;
      this.vy = (Math.random() - 0.5) * 0.40;
      this.baseRadius = isGlyph ? 3.4 : Math.random() * 1.8 + 1.2;
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
      // Elegant sinusoidal floating micro-drift for organic fluid motion
      const floatY = Math.sin(this.phase) * 0.20;
      const floatX = Math.cos(this.phase * 0.75) * 0.15;
      this.x += this.vx + floatX;
      this.y += this.vy + floatY;
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
      ctx.shadowBlur = this.isGlyph ? 12 : 6;
      ctx.fill();

      // Special orbital qubit rings on scientific biomarker nodes
      if (this.isGlyph) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, 0.25)`;
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

        // Soft Glowing Scientific Oncology Label
        if (this.glyph) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.72})`;
          ctx.shadowColor = this.theme.color;
          ctx.shadowBlur = 8;
          ctx.fillText(this.glyph, this.x + this.radius + 6, this.y + 3);
        }
      }
      ctx.restore();
    }
  }

  let linePulses = [];
  let frameCount = 0;

  function createParticles() {
    particles = [];
    linePulses = [];
    const count = Math.min(Math.max(Math.floor((width * height) / 18000), 45), 75);
    for (let i = 0; i < count; i++) {
      particles.push(new QuantumParticle(i % 4 === 0));
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
          const alpha = (1 - dist / maxDistance) * 0.32;
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p1.theme.r}, ${p1.theme.g}, ${p1.theme.b}, ${alpha})`);
          grad.addColorStop(1, `rgba(${p2.theme.r}, ${p2.theme.g}, ${p2.theme.b}, ${alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Spawn quantum energy pulse along connection
          if (frameCount % 14 === 0 && Math.random() < 0.28 && linePulses.length < 26) {
            linePulses.push({
              p1Index: i,
              p2Index: j,
              progress: 0,
              speed: 0.016 + Math.random() * 0.022,
              color: p1.theme.color,
            });
          }
        }
      }
    }
  }

  function animate() {
    frameCount++;
    ctx.clearRect(0, 0, width, height);

    // 1. Entanglement connections
    drawConnections();

    // 2. Traversing photon pulses
    for (let k = linePulses.length - 1; k >= 0; k--) {
      const pulse = linePulses[k];
      pulse.progress += pulse.speed;
      if (pulse.progress >= 1 || !particles[pulse.p1Index] || !particles[pulse.p2Index]) {
        linePulses.splice(k, 1);
        continue;
      }

      const p1 = particles[pulse.p1Index];
      const p2 = particles[pulse.p2Index];
      const px = p1.x + (p2.x - p1.x) * pulse.progress;
      const py = p1.y + (p2.y - p1.y) * pulse.progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = pulse.color;
      ctx.shadowColor = pulse.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    // 3. Particles
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
   PART 1B: CARD INTERIOR ANIMATIONS (OncoScan AI & QuantumPancreas AI)
   ========================================================================== */

/**
 * 1. OncoScan AI Card Interior: Genomic DNA helix, codon nodes, and mutation scanner
 */
function initCardOncoScanAnimation() {
  const canvas = document.getElementById('canvas-card-oncoscan');
  if (!canvas) return;
  const parent = canvas.closest('.card-oncoscan');
  if (!parent) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const mouse = { x: null, y: null, radius: 95 };

  const codons = ['KRAS', 'G12D', 'TP53', 'BRCA1', 'LUAD', 'PDAC', 'EGFR', 'A-T', 'C-G', 'TCGA', 'G12V', 'p53'];
  const palette = [
    { r: 14, g: 165, b: 233, color: '#0ea5e9' }, // Sky
    { r: 34, g: 211, b: 238, color: '#22d3ee' }, // Cyan
    { r: 52, g: 211, b: 153, color: '#34d399' }, // Emerald
    { r: 129, g: 140, b: 248, color: '#818cf8' }, // Indigo
    { r: 251, g: 113, b: 133, color: '#fb7185' } // Rose
  ];

  function resize() {
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createParticles();
  }

  class GeneNode {
    constructor(index) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.44;
      this.vy = (Math.random() - 0.5) * 0.38;
      this.radius = Math.random() * 1.6 + 1.4;
      this.theme = palette[Math.floor(Math.random() * palette.length)];
      this.hasLabel = index % 2 === 0;
      this.label = codons[index % codons.length];
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = Math.random() * 0.025 + 0.012;
      this.hasHalo = index % 4 === 0;
    }

    update() {
      // Gentle sinusoidal float for living motion
      const floatY = Math.sin(this.phase) * 0.22;
      const floatX = Math.cos(this.phase * 0.8) * 0.18;
      this.x += this.vx + floatX;
      this.y += this.vy + floatY;
      this.phase += this.phaseSpeed;

      if (this.x < 10) { this.x = 10; this.vx *= -1; }
      if (this.x > width - 10) { this.x = width - 10; this.vx *= -1; }
      if (this.y < 10) { this.y = 10; this.vy *= -1; }
      if (this.y > height - 10) { this.y = height - 10; this.vy *= -1; }

      // Mouse interactive deflection
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.8;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force;
          this.y += Math.sin(angle) * force;
        }
      }
    }

    draw() {
      const pulse = Math.sin(this.phase) * 0.35 + 0.65;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.75})`;
      ctx.shadowColor = this.theme.color;
      ctx.shadowBlur = 7;
      ctx.fill();

      // Pulsing biomarker scanner radar halo ring
      if (this.hasHalo) {
        const haloScale = ((frame * 0.025 + this.phase) % 1);
        const currentHaloR = this.radius + haloScale * 14;
        const haloAlpha = (1 - haloScale) * 0.32;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentHaloR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${haloAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Readable scientific oncology label
      if (this.hasLabel) {
        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.48})`;
        ctx.shadowBlur = 2;
        ctx.fillText(this.label, this.x + this.radius + 4, this.y + 3);
      }
      ctx.restore();
    }
  }

  let pulses = [];
  let frame = 0;

  function createParticles() {
    particles = [];
    pulses = [];
    const count = Math.min(Math.max(Math.floor((width * height) / 9500), 18), 26);
    for (let i = 0; i < count; i++) {
      particles.push(new GeneNode(i));
    }
  }

  function drawConnections() {
    const maxDist = 104;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.24;
          ctx.strokeStyle = `rgba(${p1.theme.r}, ${p1.theme.g}, ${p1.theme.b}, ${alpha})`;
          ctx.lineWidth = 0.95;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Spawn traveling data pulse
          if (frame % 16 === 0 && Math.random() < 0.35 && pulses.length < 8) {
            pulses.push({
              p1Index: i,
              p2Index: j,
              prog: 0,
              spd: 0.020 + Math.random() * 0.018,
              color: p1.theme.color
            });
          }
        }
      }
    }
  }

  // Double Helix wave curve in background
  function drawDnaHelix() {
    ctx.save();
    const time = frame * 0.016;
    const waveLength = 40;
    const amplitude = 14;
    const startX = width - 42;
    const points = Math.floor(height / 11);

    for (let i = 0; i < points; i++) {
      const y = i * 11;
      const x1 = startX + Math.sin(time + y / waveLength) * amplitude;
      const x2 = startX - Math.sin(time + y / waveLength) * amplitude;
      const alpha = 0.16 + (Math.sin(time + y / 20) * 0.08);

      // Base nodes
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 4;
      ctx.fillRect(x1 - 1, y - 1, 2.2, 2.2);
      ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
      ctx.shadowColor = '#34d399';
      ctx.fillRect(x2 - 1, y - 1, 2.2, 2.2);

      // Cross bridge every 2 points
      if (i % 2 === 0) {
        ctx.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.75})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function animate() {
    frame++;
    ctx.clearRect(0, 0, width, height);

    drawDnaHelix();
    drawConnections();

    // Traveling pulses
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.prog += p.spd;
      if (p.prog >= 1 || !particles[p.p1Index] || !particles[p.p2Index]) {
        pulses.splice(k, 1);
        continue;
      }
      const p1 = particles[p.p1Index];
      const p2 = particles[p.p2Index];
      const px = p1.x + (p2.x - p1.x) * p.prog;
      const py = p1.y + (p2.y - p1.y) * p.prog;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  parent.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  parent.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
}

/**
 * 2. QuantumPancreas AI Card Interior: 4-Qubit rails, entangled rings, and probability waves
 */
function initCardQuantumPancreasAnimation() {
  const canvas = document.getElementById('canvas-card-qml');
  if (!canvas) return;
  const parent = canvas.closest('.card-hybrid-qml');
  if (!parent) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const mouse = { x: null, y: null, radius: 105 };

  const quantumSymbols = ['|0⟩', '|1⟩', '|ψ⟩', 'q₀', 'q₁', 'q₂', 'q₃', 'CNOT', 'H', 'LYVE1', 'REG1B', 'TFF1', 'Hilbert₁₆'];
  const palette = [
    { r: 168, g: 85, b: 247, color: '#a855f7' }, // Violet
    { r: 129, g: 140, b: 248, color: '#818cf8' }, // Indigo
    { r: 34, g: 211, b: 238, color: '#22d3ee' },  // Cyan
    { r: 192, g: 132, b: 252, color: '#c084fc' }, // Purple
    { r: 232, g: 121, b: 249, color: '#e879f9' }  // Fuchsia
  ];

  function resize() {
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createParticles();
  }

  class QubitParticle {
    constructor(index) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.44;
      this.vy = (Math.random() - 0.5) * 0.38;
      this.radius = Math.random() * 1.6 + 1.4;
      this.theme = palette[Math.floor(Math.random() * palette.length)];
      this.hasOrbit = index % 2 === 0;
      this.hasLabel = index % 2 === 0;
      this.label = quantumSymbols[index % quantumSymbols.length];
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = Math.random() * 0.025 + 0.012;
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (Math.random() - 0.5) * 0.035;
    }

    update() {
      // Gentle sinusoidal float for living motion
      const floatY = Math.sin(this.phase) * 0.22;
      const floatX = Math.cos(this.phase * 0.8) * 0.18;
      this.x += this.vx + floatX;
      this.y += this.vy + floatY;
      this.phase += this.phaseSpeed;
      this.orbitAngle += this.orbitSpeed;

      if (this.x < 12) { this.x = 12; this.vx *= -1; }
      if (this.x > width - 12) { this.x = width - 12; this.vx *= -1; }
      if (this.y < 12) { this.y = 12; this.vy *= -1; }
      if (this.y > height - 12) { this.y = height - 12; this.vy *= -1; }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.8;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force;
          this.y += Math.sin(angle) * force;
        }
      }
    }

    draw() {
      const pulse = Math.sin(this.phase) * 0.35 + 0.65;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.75})`;
      ctx.shadowColor = this.theme.color;
      ctx.shadowBlur = 7;
      ctx.fill();

      // Orbital satellite ring on key quantum states
      if (this.hasOrbit) {
        ctx.strokeStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, 0.32)`;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 13, 6.5, this.orbitAngle, 0, Math.PI * 2);
        ctx.stroke();

        const satX = this.x + Math.cos(this.orbitAngle) * 13;
        const satY = this.y + Math.sin(this.orbitAngle) * 6.5;
        ctx.beginPath();
        ctx.arc(satX, satY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, 0.95)`;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 5;
        ctx.fill();
      }

      // Subtle, crisp quantum symbol label
      if (this.hasLabel) {
        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${this.theme.r}, ${this.theme.g}, ${this.theme.b}, ${pulse * 0.48})`;
        ctx.shadowBlur = 2;
        ctx.fillText(this.label, this.x + this.radius + 4, this.y + 3);
      }
      ctx.restore();
    }
  }

  let photonPulses = [];
  let frame = 0;

  function createParticles() {
    particles = [];
    photonPulses = [];
    const count = Math.min(Math.max(Math.floor((width * height) / 9500), 18), 26);
    for (let i = 0; i < count; i++) {
      particles.push(new QubitParticle(i));
    }
  }

  // 4 Horizontal Quantum Wire Rails with dual zipping photons
  function drawQuantumRails() {
    ctx.save();
    const rails = [0.22, 0.42, 0.62, 0.82];
    for (let r = 0; r < rails.length; r++) {
      const y = height * rails[r];
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.14)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([5, 9]);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling photon packets across rail (2 per rail for lively continuous motion)
      const speed = 0.009 + r * 0.003;
      const x1 = ((frame * speed * width) % (width - 40)) + 20;
      const x2 = (((frame * speed * width) + (width * 0.5)) % (width - 40)) + 20;

      [x1, x2].forEach((x, idx) => {
        ctx.beginPath();
        ctx.arc(x, y, 2.0, 0, Math.PI * 2);
        const col = (r + idx) % 2 === 0 ? 'rgba(34, 211, 238, 0.75)' : 'rgba(192, 132, 252, 0.75)';
        ctx.fillStyle = col;
        ctx.shadowColor = (r + idx) % 2 === 0 ? '#22d3ee' : '#c084fc';
        ctx.shadowBlur = 7;
        ctx.fill();
      });
    }
    ctx.restore();
  }

  // Undulating quantum probability wave at bottom of card
  function drawProbabilityWave() {
    ctx.save();
    const time = frame * 0.016;
    const waveY = height - 24;
    ctx.beginPath();
    ctx.moveTo(0, waveY);

    for (let x = 0; x <= width; x += 8) {
      const y = waveY + Math.sin(time + x * 0.018) * 6 + Math.cos(time * 0.8 + x * 0.012) * 3;
      ctx.lineTo(x, y);
    }

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
    grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.28)');
    grad.addColorStop(1, 'rgba(129, 140, 248, 0.04)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  function drawConnections() {
    const maxDist = 104;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.24;
          ctx.strokeStyle = `rgba(${p1.theme.r}, ${p1.theme.g}, ${p1.theme.b}, ${alpha})`;
          ctx.lineWidth = 0.95;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          if (frame % 16 === 0 && Math.random() < 0.35 && photonPulses.length < 8) {
            photonPulses.push({
              p1Index: i,
              p2Index: j,
              prog: 0,
              spd: 0.020 + Math.random() * 0.018,
              color: p1.theme.color
            });
          }
        }
      }
    }
  }

  function animate() {
    frame++;
    ctx.clearRect(0, 0, width, height);

    drawQuantumRails();
    drawProbabilityWave();
    drawConnections();

    for (let k = photonPulses.length - 1; k >= 0; k--) {
      const p = photonPulses[k];
      p.prog += p.spd;
      if (p.prog >= 1 || !particles[p.p1Index] || !particles[p.p2Index]) {
        photonPulses.splice(k, 1);
        continue;
      }
      const p1 = particles[p.p1Index];
      const p2 = particles[p.p2Index];
      const px = p1.x + (p2.x - p1.x) * p.prog;
      const py = p1.y + (p2.y - p1.y) * p.prog;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  parent.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  parent.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
}

/* ==========================================================================
   PART 2: SIMPLE & SLEEK CLINICAL CURSOR ENGINE
   ========================================================================== */
function initQuantumCursor() {
  // Only enable on non-touch pointer devices
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (document.getElementById('quantum-cursor-dot')) return;

  const isOncoScan = window.location.pathname.includes('oncoscan');
  const primaryColor = isOncoScan ? '#0ea5e9' : '#22d3ee';
  const hoverColor = isOncoScan ? '#10b981' : '#a855f7';

  // 1. Inject Simple, Clean Styles
  const style = document.createElement('style');
  style.id = 'quantum-cursor-styles';
  style.textContent = `
    @media (pointer: fine) {
      *, *::before, *::after {
        cursor: none !important;
      }
    }

    .q-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: ${isOncoScan ? '5px' : '5px'};
      height: ${isOncoScan ? '5px' : '5px'};
      border-radius: 50%;
      background: ${isOncoScan ? '#0ea5e9' : 'rgba(255, 255, 255, 0.9)'};
      box-shadow: ${isOncoScan 
        ? '0 0 5px rgba(14, 165, 233, 0.5)' 
        : '0 0 6px rgba(34, 211, 238, 0.45)'};
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: width 0.18s ease, 
                  height 0.18s ease, 
                  background-color 0.18s ease,
                  box-shadow 0.18s ease,
                  opacity 0.2s ease;
      opacity: 0;
    }

    .q-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: ${isOncoScan ? '24px' : '26px'};
      height: ${isOncoScan ? '24px' : '26px'};
      border-radius: 50%;
      border: 1px solid ${isOncoScan ? 'rgba(14, 165, 233, 0.35)' : 'rgba(34, 211, 238, 0.45)'};
      box-shadow: ${isOncoScan 
        ? 'none' 
        : '0 0 8px rgba(34, 211, 238, 0.18)'};
      background-color: transparent;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                  height 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.2s ease, 
                  background-color 0.2s ease,
                  box-shadow 0.2s ease,
                  transform 0.08s ease,
                  opacity 0.2s ease;
      opacity: 0;
    }

    /* Hovering state over interactive elements */
    .q-cursor-ring.hovering {
      width: ${isOncoScan ? '34px' : '36px'};
      height: ${isOncoScan ? '34px' : '36px'};
      border-color: ${isOncoScan ? 'rgba(16, 185, 129, 0.6)' : 'rgba(168, 85, 247, 0.65)'};
      background-color: ${isOncoScan ? 'rgba(16, 185, 129, 0.04)' : 'rgba(168, 85, 247, 0.05)'};
      box-shadow: ${isOncoScan 
        ? 'none' 
        : '0 0 10px rgba(168, 85, 247, 0.22)'};
    }

    .q-cursor-dot.hovering {
      width: 4px;
      height: 4px;
      background: ${isOncoScan ? '#10b981' : '#ffffff'};
      box-shadow: ${isOncoScan ? '0 0 5px rgba(16, 185, 129, 0.6)' : '0 0 5px rgba(192, 132, 252, 0.5)'};
    }

    /* Subtle press state on click */
    .q-cursor-ring.clicking {
      width: ${isOncoScan ? '18px' : '20px'};
      height: ${isOncoScan ? '18px' : '20px'};
      border-color: ${isOncoScan ? hoverColor : '#22d3ee'};
      background-color: ${isOncoScan ? 'rgba(16, 185, 129, 0.1)' : 'rgba(34, 211, 238, 0.1)'};
      box-shadow: ${isOncoScan ? 'none' : '0 0 8px rgba(34, 211, 238, 0.3)'};
    }
    .q-cursor-dot.clicking {
      transform: translate(-50%, -50%) scale(0.8);
    }
  `;
  document.head.appendChild(style);

  // 2. Create Minimal DOM Elements
  const dot = document.createElement('div');
  dot.id = 'quantum-cursor-dot';
  dot.className = 'q-cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.id = 'quantum-cursor-ring';
  ring.className = 'q-cursor-ring';
  document.body.appendChild(ring);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

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

    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
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

  // Micro-interaction on Click
  window.addEventListener('mousedown', () => {
    ring.classList.add('clicking');
    dot.classList.add('clicking');
  });

  window.addEventListener('mouseup', () => {
    ring.classList.remove('clicking');
    dot.classList.remove('clicking');
  });

  // Interactive Hover Detection (Delegated)
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .platform-card, .btn-launch-primary, .chip-badge, .status-pill, .sample-pill-container, tr, .tab-btn, [role="button"], label');
    if (target) {
      ring.classList.add('hovering');
      dot.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .platform-card, .btn-launch-primary, .chip-badge, .status-pill, .sample-pill-container, tr, .tab-btn, [role="button"], label');
    if (target) {
      ring.classList.remove('hovering');
      dot.classList.remove('hovering');
    }
  });

  // Smooth Ring Follow Loop (Fluid Lerp)
  function renderCursor() {
    if (isVisible) {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
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
  initCardOncoScanAnimation();
  initCardQuantumPancreasAnimation();
  initQuantumCursor();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAllOncoQuantumFX);
} else {
  initAllOncoQuantumFX();
}
