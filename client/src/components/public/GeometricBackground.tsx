import React, { useMemo } from "react";

interface GeometricBackgroundProps {
  palette: string[];
  intensity?: "subtle" | "normal";
}

export function GeometricBackground({ palette, intensity = "normal" }: GeometricBackgroundProps) {
  // Respect reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  const shapes = useMemo(() => {
    // Define a set of shapes inspired by the image
    // Types: full (circle), semi (half-circle), quarter (quarter), rect (rectangle)
    const items = [
      { type: "semi", color: palette[0], size: 240, top: "5%", right: "25%", rotate: 45, delay: 0 },
      { type: "full", color: palette[1], size: 180, top: "20%", right: "5%", rotate: -15, delay: 1.5 },
      { type: "quarter", color: palette[2], size: 200, top: "45%", right: "20%", rotate: 90, delay: 0.8 },
      { type: "rect", color: palette[3], size: 220, top: "10%", right: "45%", rotate: 0, delay: 2.1 },
      { type: "semi", color: palette[4], size: 160, top: "65%", right: "35%", rotate: 180, delay: 1.2 },
      { type: "full", color: palette[5], size: 280, top: "55%", right: "5%", rotate: 30, delay: 0.5 },
      { type: "quarter", color: palette[0], size: 140, top: "80%", right: "15%", rotate: -90, delay: 2.7 },
      { type: "rect", color: palette[1], size: 150, top: "35%", right: "60%", rotate: 15, delay: 1.9 },
    ];

    if (prefersReducedMotion) return items.map(s => ({ ...s, delay: 0 }));
    return items;
  }, [palette, prefersReducedMotion]);

  return (
    <div className="fixed inset-0 -z-10 bg-[#fafafa] overflow-hidden pointer-events-none select-none">
      {/* 3D Container */}
      <div 
        className="absolute inset-0 preserve-3d" 
        style={{ perspective: "1200px" }}
      >
        {shapes.map((shape, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 hidden md:block ${!prefersReducedMotion ? 'animate-float' : ''}`}
            style={{
              top: shape.top,
              right: shape.right,
              width: shape.size,
              height: shape.size,
              animationDelay: `${shape.delay}s`,
              perspective: "1000px"
            }}
          >
            <div
              className={`w-full h-full preserve-3d ${!prefersReducedMotion ? 'animate-rotate-3d' : ''}`}
              style={{
                backgroundColor: shape.color,
                borderRadius: getBorderRadius(shape.type),
                transform: `rotate(${shape.rotate}deg)`,
                animationDelay: `${shape.delay * 1.5}s`,
                opacity: intensity === "subtle" ? 0.4 : 0.8
              }}
            />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes rotate3d {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          50% { transform: rotateX(15deg) rotateY(15deg); }
          100% { transform: rotateX(0deg) rotateY(0deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-rotate-3d {
          animation: rotate3d 12s ease-in-out infinite;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}} />
    </div>
  );
}

function getBorderRadius(type: string) {
  switch (type) {
    case "full": return "9999px";
    case "semi": return "9999px 9999px 0 0";
    case "quarter": return "9999px 0 0 0";
    case "rect": return "24px";
    default: return "0";
  }
}
