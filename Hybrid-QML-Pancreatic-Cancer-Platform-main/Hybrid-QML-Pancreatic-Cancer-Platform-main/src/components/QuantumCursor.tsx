import React, { useEffect } from "react";

export const QuantumCursor: React.FC = () => {
  useEffect(() => {
    // Only enable on non-touch pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Inject simple, clean styles
    const styleId = "quantum-cursor-fx-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
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
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 8px #22d3ee;
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
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1.5px solid rgba(34, 211, 238, 0.45);
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%);
          transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                      height 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.2s ease, 
                      background-color 0.2s ease,
                      transform 0.08s ease,
                      opacity 0.2s ease;
          opacity: 0;
        }

        /* Hovering state over interactive elements */
        .q-cursor-ring.hovering {
          width: 40px;
          height: 40px;
          border-color: rgba(168, 85, 247, 0.75);
          background-color: rgba(168, 85, 247, 0.08);
        }

        .q-cursor-dot.hovering {
          width: 4px;
          height: 4px;
          background: #a855f7;
          box-shadow: 0 0 10px #a855f7;
        }

        /* Subtle press state on click */
        .q-cursor-ring.clicking {
          width: 20px;
          height: 20px;
          border-color: #a855f7;
          background-color: rgba(168, 85, 247, 0.15);
        }

        .q-cursor-dot.clicking {
          transform: translate(-50%, -50%) scale(0.8);
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
    let isVisible = false;
    let animId: number;

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

    const handleMouseDown = () => {
      ring.classList.add("clicking");
      dot.classList.add("clicking");
    };

    const handleMouseUp = () => {
      ring.classList.remove("clicking");
      dot.classList.remove("clicking");
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, input, select, textarea, [role='button'], tr, .cursor-pointer, label"
      );
      if (target) {
        ring.classList.add("hovering");
        dot.classList.add("hovering");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, input, select, textarea, [role='button'], tr, .cursor-pointer, label"
      );
      if (target) {
        ring.classList.remove("hovering");
        dot.classList.remove("hovering");
      }
    };

    function renderLoop() {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(renderLoop);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    renderLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animId);
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
};
