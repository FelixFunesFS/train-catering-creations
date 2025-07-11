import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = [{
    name: "Home",
    href: "/"
  }, {
    name: "About Us",
    href: "/about"
  }, {
    name: "Menu",
    href: "/menu"
  }, {
    name: "Wedding & Events",
    href: "/wedding-menu"
  }, {
    name: "Gallery",
    href: "/gallery"
  }, {
    name: "Reviews",
    href: "/reviews"
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className="bg-background/95 backdrop-blur-sm shadow-elegant sticky top-0 z-50 border-b border-border">
      {/* Main navigation */}
      <div className="container-wide">
        <div className="flex justify-between items-center py-4 lg:py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery Logo" 
              className="w-8 h-8 lg:w-10 lg:h-10 object-contain transition-transform duration-300 group-hover:scale-110" 
            />
            <div className="text-xl sm:text-2xl lg:text-3xl font-script font-bold text-primary group-hover:text-primary-glow transition-colors duration-300">
              Soul Train's Eatery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <nav className="flex space-x-8 xl:space-x-10">
              {navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "text-sm xl:text-base font-medium transition-all duration-300 py-2 px-1 relative group",
                    isActive(item.href) 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.name}
                  <span 
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-all duration-300",
                      isActive(item.href) 
                        ? "scale-x-100" 
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              ))}
            </nav>
            <Button asChild className="btn-primary">
              <Link to="/request-quote">Request Quote</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-border mt-4 pt-6 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "text-base font-medium transition-all duration-300 px-4 py-3 rounded-lg relative overflow-hidden",
                    isActive(item.href) 
                      ? "text-primary bg-primary-light" 
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  )} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-4">
                <Button asChild className="btn-primary w-full">
                  <Link to="/request-quote" onClick={() => setIsMenuOpen(false)}>
                    Request Quote
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>;
};