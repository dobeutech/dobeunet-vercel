import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RippleGrid } from "@/components/layout/RippleGrid";
import { getTypeformDirectUrl } from "@/config/typeform";
import { trackEvent } from "@/lib/mixpanel";

export function Hero() {
  const typeformUrl = getTypeformDirectUrl({
    utm_source: "dobeu_website",
    utm_medium: "website",
    utm_campaign: "hero",
  });

  const handleStartProject = () => {
    trackEvent("Typeform Opened", {
      source: "hero",
      text: "Start Your Project",
    });
    window.open(typeformUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Modern gradient background with subtle glow */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-card"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.08),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Animated ripple dot grid */}
      <RippleGrid className="z-0" />

      <div className="container relative z-10 px-4 sm:px-6 py-20 sm:py-28 md:py-32 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8"
        >
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
          >
            Transform Your Business With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-orange-500 animate-gradient-x">
              Custom Web Solutions
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light px-4">
            We build websites and software that help your business grow faster
            and serve customers better
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 sm:pt-8 px-4">
            <Button
              size="lg"
              onClick={handleStartProject}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 min-h-[48px]"
            >
              Start Your Project
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 font-semibold px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg transition-all hover:scale-105 min-h-[48px]"
            >
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
