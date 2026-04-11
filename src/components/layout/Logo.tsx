import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white" | "dark";
  className?: string;
}

export function Logo({ variant = "default", className }: LogoProps) {
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
