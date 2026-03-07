import { Button } from "@/components/ui/button";
import { getTypeformDirectUrl } from "@/config/typeform";
import { trackEvent } from "@/lib/mixpanel";
import { MessageSquare, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface TypeformButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  source?: string;
  text?: string;
  icon?: "message" | "calendar" | "none";
  className?: string;
  fullWidth?: boolean;
}

export function TypeformButton({
  variant = "default",
  size = "default",
  source = "website",
  text = "Learn More",
  icon = "message",
  className = "",
  fullWidth = false,
}: TypeformButtonProps) {
  const typeformUrl = getTypeformDirectUrl({
    utm_source: "dobeu_website",
    utm_medium: "website",
    utm_campaign: source,
  });

  const handleClick = () => {
    trackEvent("Typeform Opened", { source, text });
    window.open(typeformUrl, "_blank", "noopener,noreferrer");
  };

  const IconComponent =
    icon === "message" ? MessageSquare : icon === "calendar" ? Calendar : null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={fullWidth ? "w-full" : ""}
    >
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={fullWidth ? `${className} w-full`.trim() : className}
        aria-label={text}
      >
        {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
        {text}
      </Button>
    </motion.div>
  );
}

/**
 * Preset button variants for common use cases
 */

export function LearnMoreButton({
  source = "learn-more",
}: {
  source?: string;
}) {
  return (
    <TypeformButton
      variant="default"
      size="lg"
      source={source}
      text="Learn More"
      icon="message"
      className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl"
    />
  );
}

export function MeetButton({ source = "meet" }: { source?: string }) {
  return (
    <TypeformButton
      variant="default"
      size="lg"
      source={source}
      text="Schedule a Meeting"
      icon="calendar"
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl"
    />
  );
}

export function HeaderTypeformButton({
  source = "header",
}: {
  source?: string;
}) {
  return (
    <TypeformButton
      variant="default"
      size="default"
      source={source}
      text="Get Started"
      icon="none"
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    />
  );
}
