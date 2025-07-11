import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Menu", href: "/menu" },
    { name: "Wedding & Events", href: "/wedding-menu" },
    { name: "Gallery", href: "/gallery" },
    { name: "Reviews", href: "/reviews" },
    { name: "Request Quote", href: "/request-quote" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background shadow-elegant sticky top-0 z-50">
      {/* Enhanced Contact Bar */}
      <div className="bg-gradient-primary py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-sm text-primary-foreground">
            
            {/* Contact Information */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6">
              <a href="tel:8439700265" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">(843) 970-0265</span>
              </a>
              <a href="mailto:soultrainseatery@gmail.com" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">soultrainseatery@gmail.com</span>
              </a>
              <div className="hidden md:flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Charleston, SC Metro</span>
              </div>
            </div>

            {/* Business Hours & CTA */}
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>By Appointment</span>
              </div>
              <Link 
                to="/request-quote" 
                className="bg-primary-foreground text-primary px-4 py-1.5 rounded-full text-xs font-semibold hover:shadow-glow transition-all duration-300 transform hover:scale-105"
              >
                Get Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="text-2xl lg:text-3xl font-elegant font-bold text-primary">
              Soul Train's
            </div>
            <div className="text-xl lg:text-2xl font-script text-muted-foreground">
              Eatery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-2",
                  isActive(item.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-4 py-3 rounded-md",
                    isActive(item.href)
                      ? "text-primary bg-primary-light"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};