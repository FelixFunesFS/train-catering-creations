import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
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
    <Button
      onClick={scrollToTop}
      variant="default"
      size="icon"
      className={cn(
        "fixed z-50 shadow-glow transition-all duration-300",
        "right-4 lg:right-6",
        // Mobile: above MobileActionBar, Desktop: bottom corner
        isMobile 
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom)+0.5rem)]" 
          : "bottom-6",
        // Visibility animation
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-4 scale-90 pointer-events-none",
        // Touch target and styling
        "h-12 w-12 rounded-full bg-ruby hover:bg-ruby-dark"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
