import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  rgb: [number, number, number];
  glyph?: string;
  phase: number;
  phaseSpeed: number;
  orbitAngle: number;
  orbitSpeed: number;
}

const GLYPHS = [
  "|0⟩", "|1⟩", "|ψ⟩", "|0000⟩", "|1111⟩",
  "LYVE1", "REG1B", "TFF1", "CA 19-9", "VQC", "Hilbert₁₆", "CNOT"
];

const PALETTE: Array<{ color: string; rgb: [number, number, number] }> = [
  { color: "#22d3ee", rgb: [34, 211, 238] },  // Cyan (Hilbert space)
  { color: "#818cf8", rgb: [129, 140, 248] }, // Indigo (Quantum ansatz)
  { color: "#a855f7", rgb: [168, 85, 247] }, // Violet (PDAC entanglement)
  { color: "#34d399", rgb: [52, 211, 153] }, // Emerald (Normal baseline)
  { color: "#38bdf8", rgb: [56, 189, 248] }, // Sky (AngleEmbedding)
  { color: "#f43f5e", rgb: [244, 63, 94] },  // Rose (Oncogenic marker)
];

export const QuantumBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null as number | null, y: null as number | null, radius: 170 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 18000), 75);

      for (let i = 0; i < particleCount; i++) {
        const theme = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const isGlyph = i % 4 === 0;
        const baseRadius = isGlyph ? 3.5 : Math.random() * 2.2 + 1.2;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: baseRadius,
          baseRadius,
          color: theme.color,
          rgb: theme.rgb,
          glyph: isGlyph ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : undefined,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.025 + 0.01,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.035,
        });
      }
    };

    initParticles();

    // Pulses traversing along entanglement lines
    const linePulses: Array<{
      p1Index: number;
      p2Index: number;
      progress: number;
      speed: number;
      color: string;
    }> = [];

    let frame = 0;
    const maxConnectionDist = 155;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing entangled lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectionDist) {
            const alpha = (1 - dist / maxConnectionDist) * 0.26;
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(${p1.rgb[0]}, ${p1.rgb[1]}, ${p1.rgb[2]}, ${alpha})`);
            grad.addColorStop(1, `rgba(${p2.rgb[0]}, ${p2.rgb[1]}, ${p2.rgb[2]}, ${alpha})`);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.1;
            ctx.stroke();

            // Occasionally spawn a quantum energy pulse along this line
            if (frame % 45 === 0 && Math.random() < 0.04 && linePulses.length < 12) {
              linePulses.push({
                p1Index: i,
                p2Index: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02,
                color: p1.color,
              });
            }
          }
        }
      }

      // 2. Render traversing energy pulses
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
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // 3. Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.phaseSpeed;
        p.orbitAngle += p.orbitSpeed;

        // Boundary wrapping
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Interactive mouse elasticity
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 1.8;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
          }
        }

        const pulseScale = Math.sin(p.phase) * 0.35 + 0.65;

        ctx.save();
        // Central node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${pulseScale * 0.9})`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.glyph ? 16 : 8;
        ctx.fill();

        // Orbital qubit ring + satellite
        if (p.glyph) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, 0.28)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 18, 8, p.orbitAngle, 0, Math.PI * 2);
          ctx.stroke();

          // Satellite particle
          const satX = p.x + Math.cos(p.orbitAngle) * 18;
          const satY = p.y + Math.sin(p.orbitAngle) * 8;
          ctx.beginPath();
          ctx.arc(satX, satY, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, 0.95)`;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Aurora Ambient Gradient Wave Mesh */}
      <div className="quantum-aurora-glow" />

      {/* Quantum Grid Mesh */}
      <div className="quantum-circuit-grid" />

      {/* Interactive 60fps Particle Entanglement Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ opacity: 0.92 }}
      />
    </>
  );
};
