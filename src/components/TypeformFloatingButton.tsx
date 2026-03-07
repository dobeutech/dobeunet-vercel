import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare } from "lucide-react";
import { getTypeformDirectUrl } from "@/config/typeform";
import { trackEvent } from "@/lib/mixpanel";
import { cn } from "@/lib/utils";

interface TypeformFloatingButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  source?: string;
  title?: string;
}

export function TypeformFloatingButton({
  position = "bottom-right",
  source = "floating-button",
  title = "Let's Talk",
}: TypeformFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeformUrl = getTypeformDirectUrl({
    utm_source: "dobeu_website",
    utm_medium: "website",
    utm_campaign: source,
  });

  const handleClick = useCallback(() => {
    trackEvent("Typeform Opened", { source, text: title });
    window.open(typeformUrl, "_blank", "noopener,noreferrer");
  }, [typeformUrl, source, title]);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-20 right-6",
    "top-left": "top-20 left-6",
  };

  return (
    <motion.div
      className={cn("fixed z-40", positionClasses[position])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3, ease: "backOut" }}
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative group",
          "flex items-center gap-3",
          "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500",
          "text-white font-semibold",
          "rounded-full shadow-lg hover:shadow-2xl",
          "transition-all duration-300",
          "overflow-hidden",
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open contact form"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3 px-6 py-4">
          <MessageSquare className="w-6 h-6" />
          <AnimatePresence mode="wait">
            {isHovered && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {title}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </motion.div>
  );
}
