import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { getTypeformDirectUrl } from "@/config/typeform";
import { trackEvent } from "@/lib/mixpanel";

export function EnhancedHero() {
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
    window.open(typeformUrl, "_blank");
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.03), transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Grid pattern - subtle like huggingface.co */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 px-4 sm:px-6 py-20 sm:py-24 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge - clean pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Available for new projects
            </span>
          </motion.div>

          {/* Main headline - clean typography */}
          <motion.h1
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="block">Build your</span>
            <span className="block text-primary">digital product</span>
          </motion.h1>

          {/* Subtitle - clean and readable */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            We design and develop fast, modern websites and software that help
            ambitious businesses grow and stand out.
          </motion.p>

          {/* CTA Buttons - clean, minimal */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={handleStartProject}
              className="w-full sm:w-auto px-8 py-6 text-base font-medium rounded-lg flex items-center gap-2"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-base font-medium rounded-lg"
            >
              <Link to="/services" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Explore Services
              </Link>
            </Button>
          </motion.div>

          {/* Stats - clean horizontal layout */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">50+</span>
              <span className="text-muted-foreground">Projects delivered</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">25+</span>
              <span className="text-muted-foreground">
                Technology offerings
              </span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">5+</span>
              <span className="text-muted-foreground">Years experience</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - minimal */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-border flex justify-center pt-2">
            <motion.div
              className="w-1 h-1 rounded-full bg-muted-foreground"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
