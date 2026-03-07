import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { ExternalLink, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { WantToLearnMoreLink } from "@/components/WantToLearnMoreLink";

export function FloatingFooter() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  return (
    <footer
      ref={footerRef}
      className="border-t border-border bg-background"
      role="contentinfo"
    >
      {/* CTA Section */}
      <motion.div
        className="container mx-auto px-4 py-16 md:py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6 pb-16 border-b border-border">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to start your project?
          </h2>
          <p className="text-muted-foreground">
            Let's build something incredible together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="rounded-lg">
              <Link to="/contact" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <WantToLearnMoreLink source="footer-cta" variant="footer" />
            <Button asChild size="lg" variant="outline" className="rounded-lg">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Links Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 space-y-4">
            <Logo className="h-6" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Building exceptional digital experiences that drive growth and
              innovation.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Services</h3>
            <ul className="space-y-3">
              {[
                { label: "Web Development", href: "/services#website" },
                { label: "Software Solutions", href: "/services#software" },
                { label: "Consulting", href: "/services#consulting" },
                { label: "Training", href: "/services#learning" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Pricing", href: "/pricing" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://contra.com/jeremy_williams_fx413nca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Hire on Contra
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/jeremywilliams62"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Behance
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "SMS Policy", href: "/privacy/sms" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Do Not Sell My Data", href: "/ccpa-optout" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Dobeu Tech Solutions. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
