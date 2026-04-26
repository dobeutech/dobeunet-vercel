import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  variant?: "default" | "white" | "dark";
  className?: string;
}

// Only reference logo files that actually exist in public/
const LOGO_SOURCES = ["/icon.svg"];

function SvgTextLogo({
  variant,
  className,
}: {
  variant: "default" | "white" | "dark";
  className?: string;
}) {
  const fillColor =
    variant === "white"
      ? "#FFFFFF"
      : variant === "dark"
        ? "#000000"
        : "currentColor";

  return (
    <svg
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-label="DOBEU Logo"
    >
      <text
        x="10"
        y="40"
        fill={fillColor}
        fontSize="32"
        fontWeight="800"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        letterSpacing="-0.02em"
      >
        DOBEU
      </text>
    </svg>
  );
}

export function Logo({ variant = "default", className }: LogoProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // If all image sources failed, show SVG fallback
  if (imageError || currentSrcIndex >= LOGO_SOURCES.length) {
    return <SvgTextLogo variant={variant} className={className} />;
  }

  const logoSrc = LOGO_SOURCES[currentSrcIndex];

  return (
    <img
      src={logoSrc}
      alt="DOBEU Logo"
      className={cn("h-8 w-auto object-contain", className)}
      onError={() => {
        // Advance to the next source. If all sources are exhausted the
        // `currentSrcIndex >= LOGO_SOURCES.length` guard above will
        // render the SVG fallback on the next render.
        setCurrentSrcIndex((index) => index + 1);
      }}
    />
  );
}
