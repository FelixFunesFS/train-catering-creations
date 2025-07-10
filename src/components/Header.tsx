import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail } from "lucide-react";
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
    <header className="bg-background shadow-card sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="bg-gradient-primary py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center sm:justify-end items-center space-x-6 text-sm text-primary-foreground">
            <a href="tel:8439700265" className="flex items-center space-x-1 hover:opacity-80 transition-opacity">
              <Phone className="h-3 w-3" />
              <span>(843) 970-0265</span>
            </a>
            <a href="mailto:soultrainseatery@gmail.com" className="flex items-center space-x-1 hover:opacity-80 transition-opacity">
              <Mail className="h-3 w-3" />
              <span>soultrainseatery@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl lg:text-3xl font-elegant font-bold text-primary">
              Soul Train's
            </div>
            <div className="text-xl lg:text-2xl font-script text-muted-foreground">
              Eatery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href)
                    ? "text-primary border-b-2 border-primary pb-1"
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
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-2 py-1",
                    isActive(item.href)
                      ? "text-primary bg-primary-light rounded-md"
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