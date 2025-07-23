
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const navigation = [{
    name: "Home",
    href: "/"
  }, {
    name: "About Us",
    href: "/about#page-header"
  }, {
    name: "Menu",
    href: "/menu#page-header"
  }, {
    name: "Wedding & Events",
    href: "/wedding-menu#page-header"
  }, {
    name: "Gallery",
    href: "/gallery#page-header"
  }, {
    name: "Reviews",
    href: "/reviews#page-header"
  }];
  
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
        "bg-gradient-to-br from-background via-muted/20 to-background backdrop-blur-md border-b border-border/20 sticky top-0 z-50 transition-all duration-300",
        "neumorphic-card-3",
        isScrolled && "shadow-elegant"
      )}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-0 my-0">
          <div className="flex justify-between items-center py-1 sm:py-2">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300 focus-visible-enhanced" aria-label="Soul Train's Eatery - Home">
              <div className="text-2xl lg:text-3xl font-script font-bold text-foreground">
                Soul Train's Eatery
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2" aria-label="Main navigation">
              {navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 focus-visible-enhanced hover:scale-105 hover:-translate-y-0.5",
                    "neumorphic-button",
                    isActive(item.href) 
                      ? "active text-foreground bg-muted/50 font-semibold neumorphic-card-2" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )} 
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild variant="default" size="sm" className="text-sm font-medium px-4 py-2 rounded-lg neumorphic-button-primary">
                <Link to="/request-quote#page-header">Request Quote</Link>
              </Button>
            </nav>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center">
              <Button 
                className="neumorphic-button bg-transparent hover:bg-muted/30 text-foreground hover:text-foreground transition-all duration-300 focus-visible-enhanced p-2 h-auto w-auto" 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                aria-expanded={isMenuOpen} 
                aria-controls="mobile-menu" 
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-10 w-10 md:h-12 md:w-12" strokeWidth={2.5} />
                ) : (
                  <svg className="h-10 w-10 md:h-12 md:w-12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h16" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav id="mobile-menu" className="lg:hidden pb-6" aria-label="Mobile navigation">
              <div className="neumorphic-card-2 rounded-xl p-4 mt-4">
                <div className="flex flex-col space-y-3">
                  {navigation.map(item => (
                    <Link 
                      key={item.name} 
                      to={item.href} 
                      className={cn(
                        "text-base font-medium px-4 py-3 rounded-lg transition-all duration-300 focus-visible-enhanced",
                        "neumorphic-card-1",
                        isActive(item.href) 
                          ? "active text-primary bg-muted font-semibold border-l-4 border-primary" 
                          : "text-foreground hover:text-primary hover:translate-x-1 hover:bg-muted/50"
                      )} 
                      onClick={() => setIsMenuOpen(false)} 
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex justify-center mt-4">
                    <Button asChild variant="default" size="responsive-sm" className="w-3/5 sm:w-auto sm:min-w-[14rem] neumorphic-button-primary">
                      <Link to="/request-quote#page-header" onClick={() => setIsMenuOpen(false)}>
                        Request Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};
