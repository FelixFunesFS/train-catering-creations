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
  return <header className="bg-background shadow-elegant sticky top-0 z-50">
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-8 h-8 object-contain" />
            <div className="text-2xl lg:text-3xl font-script font-bold text-primary">Soul Train's Eatery</div>
            
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <nav className="flex space-x-10">
              {navigation.map(item => <Link key={item.name} to={item.href} className={cn("text-sm font-medium transition-colors hover:text-primary py-2", isActive(item.href) ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}>
                  {item.name}
                </Link>)}
            </nav>
            <Button asChild variant="cta" size="responsive-md">
              <Link to="/request-quote">Request Quote</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="lg:hidden pb-6">
            <nav className="flex flex-col space-y-4">
              {navigation.map(item => <Link key={item.name} to={item.href} className={cn("text-sm font-medium transition-colors hover:text-primary px-4 py-3 rounded-md", isActive(item.href) ? "text-primary bg-primary-light" : "text-muted-foreground")} onClick={() => setIsMenuOpen(false)}>
                  {item.name}
                </Link>)}
              <Button asChild variant="cta" size="responsive-md">
                <Link to="/request-quote" onClick={() => setIsMenuOpen(false)}>
                  Request Quote
                </Link>
              </Button>
            </nav>
          </div>}
      </div>
    </header>;
};