import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CursorToggle } from "@/components/CursorToggle";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { NavigationSearch } from "@/components/navigation/NavigationSearch";
import { useNavigation } from "@/contexts/NavigationContext";
import { publicNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/mixpanel";
import { WantToLearnMoreLink } from "@/components/WantToLearnMoreLink";

export function GlassmorphicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const handleNavClick = (label: string, href: string) => {
    trackEvent("Navigation Click", { label, href });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-200",
        isMobileMenuOpen
          ? "bg-background border-b border-border"
          : isScrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-subtle"
            : "bg-transparent",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
            aria-label="DOBEU Home"
            onClick={() => handleNavClick("Logo", "/")}
          >
            <Logo className="h-7" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNavigation.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => handleNavClick(item.label, item.href)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-muted transition-colors duration-150",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-1">
            <NavigationSearch />
            <LanguageSelector />
            <AccessibilitySettings />
            <CursorToggle />
            <ThemeToggle />

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-2" />

            <WantToLearnMoreLink source="header" variant="header" />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageSelector />
            <AccessibilitySettings />
            <CursorToggle />
            <ThemeToggle />
            <button
              className={cn(
                "p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-colors duration-150",
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            role="menu"
            className="md:hidden py-4 border-t border-border animate-fade-in"
          >
            <MobileMenu
              publicItems={publicNavigation}
              categories={[]}
              isAuthenticated={false}
              isAdmin={false}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
}
