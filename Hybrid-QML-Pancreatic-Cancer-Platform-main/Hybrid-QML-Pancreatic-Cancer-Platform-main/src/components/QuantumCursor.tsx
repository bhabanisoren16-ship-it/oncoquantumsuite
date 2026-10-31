import React, { useEffect } from "react";

export const QuantumCursor: React.FC = () => {
  useEffect(() => {
    // Ensure all custom cursor elements and styles are cleaned up
    const dot = document.getElementById("quantum-cursor-dot");
    if (dot) dot.remove();
    const ring = document.getElementById("quantum-cursor-ring");
    if (ring) ring.remove();
    const style = document.getElementById("quantum-cursor-fx-style");
    if (style) style.remove();
    const prebootStyle = document.getElementById("quantum-cursor-styles");
    if (prebootStyle) prebootStyle.remove();
  }, []);

  return null;
};
