import { useEffect, useRef } from "react";

interface RippleGridProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
}

export function RippleGrid({
  className = "",
  dotColor = "hsl(var(--foreground))",
  dotSize = 6,
  gap = 16,
}: RippleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cols = Math.ceil(rect.width / gap) + 1;
      const rows = Math.ceil(rect.height / gap) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap;
          const y = j * gap;

          // Wave calculation - synchronized diagonal wave like gifted.ai
          const diagonalPos = (x + y) * 0.015;
          const verticalWave = Math.sin(y * 0.025 - time * 1.2);
          const horizontalWave = Math.sin(x * 0.02 - time * 0.8);

          // Primary synchronized wave moving diagonally
          const primaryWave = Math.sin(diagonalPos - time * 1.5);

          // Combine waves for organic movement
          const combinedWave =
            primaryWave * 0.6 + verticalWave * 0.25 + horizontalWave * 0.15;

          // Higher contrast opacity range
          const normalizedWave = (combinedWave + 1) / 2; // 0 to 1
          const opacity = 0.1 + normalizedWave * 0.7;

          // Size variation for depth effect
          const scale = 0.4 + normalizedWave * 0.8;

          ctx.beginPath();
          ctx.arc(x, y, (dotSize / 2) * scale, 0, Math.PI * 2);
          ctx.fillStyle = dotColor
            .replace(")", ` / ${opacity})`)
            .replace("hsl(", "hsla(");
          ctx.fill();
        }
      }

      time += 0.025;
      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dotColor, dotSize, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}
