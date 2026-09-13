import React, { useEffect } from "react";

export const QuantumCursor: React.FC = () => {
  useEffect(() => {
    // Only enable on non-touch pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Inject styles
    const styleId = "quantum-cursor-fx-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
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
    }

    const dot = document.createElement("div");
    dot.className = "q-cursor-dot";
    document.body.appendChild(dot);

    const ring = document.createElement("div");
    ring.className = "q-cursor-ring";
    document.body.appendChild(ring);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let ringAngle = 0;
    let isVisible = false;
    let lastSparkTime = 0;
    let animId: number;

    const sparkColors = ["#22d3ee", "#818cf8", "#a855f7", "#34d399", "#fb7185"];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        ringX = mouseX;
        ringY = mouseY;
      }

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      const now = performance.now();
      if (now - lastSparkTime > 32) {
        lastSparkTime = now;
        createSpark(mouseX, mouseY);
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const handleMouseDown = (e: MouseEvent) => {
      const wave = document.createElement("div");
      wave.className = "q-cursor-click-wave";
      wave.style.left = `${e.clientX}px`;
      wave.style.top = `${e.clientY}px`;
      document.body.appendChild(wave);
      setTimeout(() => wave.remove(), 550);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, input, select, textarea, [role='button'], tr, .cursor-pointer"
      );
      if (target) {
        ring.classList.add("hovering");
        dot.classList.add("hovering");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, input, select, textarea, [role='button'], tr, .cursor-pointer"
      );
      if (target) {
        ring.classList.remove("hovering");
        dot.classList.remove("hovering");
      }
    };

    function createSpark(x: number, y: number) {
      const spark = document.createElement("div");
      spark.className = "q-cursor-spark";
      const size = Math.random() * 2.5 + 1.5;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;

      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 6px ${color}`;

      const dx = (Math.random() - 0.5) * 22;
      const dy = (Math.random() - 0.5) * 22;
      spark.style.setProperty("--dx", `${dx}px`);
      spark.style.setProperty("--dy", `${dy}px`);

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 500);
    }

    function renderLoop() {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ringAngle += 0.025;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${ringAngle}rad)`;
      }
      animId = requestAnimationFrame(renderLoop);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    renderLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animId);
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
};
