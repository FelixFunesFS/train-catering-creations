
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const navigation = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about#page-header" },
    { name: "Menu", href: "/menu#page-header" },
    { name: "Wedding & Events", href: "/wedding-menu#page-header" },
    { name: "Gallery", href: "/gallery#page-header" },
    { name: "Reviews", href: "/reviews#page-header" }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <SkipToContent targetId="main-content">
        Skip to main content
      </SkipToContent>
      
      <header className={cn(
        "bg-background/80 backdrop-blur-md border-b border-border/20 sticky top-0 z-50 transition-all duration-300 dark:bg-background/90",
        isScrolled && "shadow-lg"
      )}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-2 sm:py-3">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center hover:scale-105 transition-transform duration-300 focus-visible-enhanced"
              aria-label="Soul Train's Eatery - Home"
            >
              <div className="logo-neumorphic rounded-xl px-4 py-2 mr-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10">
                  <img 
                    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                    alt="Soul Train's Eatery Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-script font-bold text-foreground">
                Soul Train's Eatery
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4" aria-label="Main navigation">
              {navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "nav-link-neumorphic text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 focus-visible-enhanced",
                    isActive(item.href) 
                      ? "active text-primary font-semibold" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <Button 
                asChild 
                variant="cta" 
                size="sm"
                className="text-sm font-medium px-4 py-2 rounded-lg neumorphic-button-primary"
              >
                <Link to="/request-quote#page-header">Request Quote</Link>
              </Button>
              <ThemeToggle />
            </nav>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                className="nav-link-neumorphic hover:scale-110 transition-all duration-300 focus-visible-enhanced" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? 
                  <X className="h-6 w-6" strokeWidth={2} /> : 
                  <Menu className="h-6 w-6" strokeWidth={2} />
                }
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav 
              id="mobile-menu"
              className="lg:hidden pb-6" 
              aria-label="Mobile navigation"
            >
              <div className="nav-glassmorphic rounded-xl p-4 mt-4 border border-border/20 neumorphic-card-2">
                <div className="flex flex-col space-y-3">
                  {navigation.map(item => (
                    <Link 
                      key={item.name} 
                      to={item.href} 
                      className={cn(
                        "nav-link-neumorphic text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300 focus-visible-enhanced",
                        isActive(item.href) 
                          ? "active text-primary bg-primary/10 font-semibold border-l-2 border-primary" 
                          : "text-muted-foreground hover:text-primary hover:translate-x-1"
                      )} 
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button 
                    asChild 
                    variant="cta" 
                    size="responsive-sm" 
                    className="w-full mt-4 neumorphic-button-primary"
                  >
                    <Link to="/request-quote#page-header" onClick={() => setIsMenuOpen(false)}>
                      Request Quote
                    </Link>
                  </Button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};
