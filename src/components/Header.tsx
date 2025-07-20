
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
  
  return (
    <header className="nav-glassmorphic sticky top-0 z-50">
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-3 sm:py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300">
            <div className="logo-neumorphic rounded-xl px-4 py-2 mr-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10">
                <img 
                  src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                  alt="Soul Train's Eatery Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-script font-bold text-primary">
              Soul Train's Eatery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <nav className="flex space-x-4">
              {navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "nav-link-neumorphic text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300",
                    isActive(item.href) 
                      ? "active text-primary font-semibold" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <Button 
              asChild 
              variant="cta" 
              size="responsive-sm" 
              className="w-3/5 sm:w-auto sm:min-w-[12rem] shadow-glow hover:shadow-glow-strong"
            >
              <Link to="/request-quote#page-header">Request Quote</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden nav-link-neumorphic hover:scale-110 transition-all duration-300" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 
              <X className="h-6 w-6" strokeWidth={2} /> : 
              <Menu className="h-6 w-6" strokeWidth={2} />
            }
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6">
            <div className="nav-glassmorphic rounded-xl p-4 mt-4 border border-border/20">
              <nav className="flex flex-col space-y-3">
                {navigation.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.href} 
                    className={cn(
                      "nav-link-neumorphic text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300",
                      isActive(item.href) 
                        ? "active text-primary bg-primary/10 font-semibold border-l-2 border-primary" 
                        : "text-muted-foreground hover:text-primary hover:translate-x-1"
                    )} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button 
                  asChild 
                  variant="cta" 
                  size="responsive-sm" 
                  className="w-full mt-4 shadow-glow hover:shadow-glow-strong"
                >
                  <Link to="/request-quote#page-header" onClick={() => setIsMenuOpen(false)}>
                    Request Quote
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
