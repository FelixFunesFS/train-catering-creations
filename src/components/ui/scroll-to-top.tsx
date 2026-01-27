import { useState, useEffect } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Route-based hiding
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(location.pathname);
  const hidden = isAdminRoute || isQuoteWizard;

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Check initial state
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (hidden) return null;

  return (
    <div
      className={cn(
        "fixed right-4 lg:right-6 z-50 flex flex-col gap-2",
        isMobile 
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom)+0.5rem)]" 
          : "bottom-6",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none",
        "transition-all duration-300"
      )}
    >
      {/* Phone Call Button - Mobile Only */}
      {isMobile && (
        <Button
          asChild
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full bg-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,35%)] shadow-glow text-white"
          aria-label="Call Soul Train's Eatery"
        >
          <a href="tel:8439700265">
            <Phone className="h-5 w-5" />
          </a>
        </Button>
      )}
      
      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full bg-ruby hover:bg-ruby-dark shadow-glow"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
