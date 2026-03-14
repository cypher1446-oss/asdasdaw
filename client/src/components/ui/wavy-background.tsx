import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  className,
  containerClassName,
  blur = 40,
  speed = 0.002,
  ...props
}: any) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let nt = 0;
    let animId: number;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Soft pastel — visible but not overpowering
    const waveColors = [
      "rgba(147, 197, 253, 0.45)", // sky blue
      "rgba(196, 181, 253, 0.4)",  // lavender
      "rgba(110, 231, 183, 0.35)", // mint
      "rgba(252, 165, 165, 0.35)", // rose
      "rgba(253, 211, 77,  0.3)",  // amber
    ];

    const drawWave = (n: number) => {
      nt += speed;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = 120;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        ctx.globalAlpha = 1;
        for (let x = 0; x <= w; x += 4) {
          const y = noise(x / 700, 0.45 * i, nt) * 130;
          if (x === 0) ctx.moveTo(x, y + h * 0.5);
          else ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f8fafc"; // slate-50
      ctx.fillRect(0, 0, w, h);

      ctx.filter = `blur(${blur}px)`;
      drawWave(5);
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};
