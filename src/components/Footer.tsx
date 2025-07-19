
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Star } from "lucide-react";
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigationLinks = [{
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
  }, {
    name: "Request Quote",
    href: "/request-quote#page-header"
  }];
  const services = ["Military Functions", "Corporate Catering", "Wedding Catering", "Private Events", "Holiday Parties", "Funeral Repasts", "Custom Menus"];
  return <footer className="bg-gradient-card border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Information */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-10 h-10 object-contain" />
              <div className="text-2xl font-script font-bold text-primary">Soul Train's Eatery</div>
              
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Authentic soul food catering bringing comfort and flavor to your special events. 
              From intimate gatherings to large celebrations, we serve love on every plate.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent-foreground" fill="currentColor" />
                <span>Premium Catering Services</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent-foreground" fill="currentColor" />
                <span>Licensed & Insured</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-elegant font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a href="tel:8439700265" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-200 group">
                <Phone className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                <span>Call (843) 970-0265</span>
              </a>
              <a href="mailto:soultrainseatery@gmail.com" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-200 group">
                <Mail className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                <span>soultrainseatery@gmail.com</span>
              </a>
              <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  <p>Charleston, SC Metro Area</p>
                  <p className="text-xs">Serving all surrounding areas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p>By Appointment</p>
                  <p className="text-xs">Call for availability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-elegant font-semibold text-foreground mb-4">Quick Links</h3>
            <nav className="space-y-2">
              {navigationLinks.map(item => <Link key={item.name} to={item.href} className="block text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200">
                  {item.name}
                </Link>)}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-elegant font-semibold text-foreground mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {service}
                </li>)}
            </ul>
          </div>
        </div>

        {/* Social Media & Testimonial */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Follow Us:</span>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Customer Testimonial */}
            <div className="text-center lg:text-right">
              <p className="text-sm text-muted-foreground italic">
                "Soul Train's Eatery made our wedding perfect with their amazing food!"
              </p>
              <p className="text-xs text-muted-foreground mt-1">- Happy Customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copyright Bar with better neutral balance */}
      <div className="bg-secondary border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-secondary-foreground">
            <div className="flex items-center space-x-3">
              
              <p>© {currentYear} Soul Train's Eatery. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap space-x-3 mt-2 sm:mt-0 text-center sm:text-right">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors duration-200">Privacy Policy</Link>
              <span>|</span>
              <Link to="/terms-conditions" className="hover:text-primary transition-colors duration-200">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
