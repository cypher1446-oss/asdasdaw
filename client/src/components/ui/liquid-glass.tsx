"use client";

import React from "react";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
}

const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
}) => {
  const glassStyle = {
    boxShadow: "0 6px 6px rgba(0,0,0,0.15),0 0 20px rgba(0,0,0,0.08)",
    transitionTimingFunction: "cubic-bezier(0.175,0.885,0.32,2.2)",
    ...style,
  };

  return (
    <div
      className={`relative flex overflow-hidden transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      <div
        className="absolute inset-0 z-0 rounded-inherit"
        style={{
          backdropFilter: "blur(4px)",
          filter: "url(#glass-distortion)",
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-inherit"
        style={{ background: "rgba(255,255,255,0.45)" }}
      />

      <div className="relative z-20">{children}</div>
    </div>
  );
};

export default GlassEffect;
