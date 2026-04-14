import { useState, useEffect } from "react";
import saltyPickleIcon from "@/assets/salty-pickle-icon.png";
import { Button } from "@/components/ui/button";

const StickyNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-[0_4px_20px_hsl(var(--primary)/0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <a href="#" className="flex items-center gap-2 group">
          <img
            src={saltyPickleIcon}
            alt="Salty Pickle"
            width={36}
            height={36}
            className="w-9 h-9 transition-transform duration-200 group-hover:rotate-12"
          />
          <span className="font-metal text-sm tracking-[0.15em] uppercase text-foreground hidden sm:inline">
            Salty Pickle
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="#features"
            className="hidden md:inline text-sm font-body text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="hidden md:inline text-sm font-body text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Runners
          </a>
          <a
            href="#pricing"
            className="hidden md:inline text-sm font-body text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Pricing
          </a>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-display text-xs px-5 py-2 uppercase tracking-wider border-2 border-primary hover:bg-primary/80 transition-all duration-200 hover:scale-105"
            onClick={() => document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" })}
          >
            JOIN
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default StickyNav;
