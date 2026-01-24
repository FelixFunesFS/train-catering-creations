import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Star } from "lucide-react";
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigationLinks = [{
    name: "Home",
    href: "/"
  }, {
    name: "About Us",
    href: "/about"
  }, {
    name: "Menu",
    href: "/menu"
  }, {
    name: "Weddings",
    href: "/menu?style=wedding"
  }, {
    name: "Gallery",
    href: "/gallery"
  }, {
    name: "Reviews",
    href: "/reviews"
  }, {
    name: "FAQ",
    href: "/faq"
  }, {
    name: "Request Quote",
    href: "/request-quote#page-header"
  }];
  const services = ["Military Functions", "Corporate Catering", "Wedding Catering", "Private Events", "Holiday Parties", "Funeral Repasts", "Custom Menus"];
  return <footer className="bg-gradient-to-br from-background via-muted/20 to-background border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-10 h-10 object-contain" />
              <div className="text-2xl font-script font-bold text-foreground">Soul Train's Eatery</div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Authentic soul food catering bringing comfort and flavor to your special events. 
              From intimate gatherings to large celebrations, we serve love on every plate.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-primary" fill="currentColor" />
                <span>Premium Catering Services</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-primary" fill="currentColor" />
                <span>Licensed & Insured</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold text-foreground border-b border-border pb-2">Contact Us</h3>
            <div className="space-y-4">
              <a href="tel:8439700265" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-200 group">
                <Phone className="h-5 w-5 text-primary" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">Call (843) 970-0265</span>
              </a>
              <a href="mailto:soultrainseatery@gmail.com" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-200 group">
                <Mail className="h-5 w-5 text-primary" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">soultrainseatery@gmail.com</span>
              </a>
              <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p>Charleston, SC Metro Area</p>
                  <p className="text-xs opacity-75">Serving all surrounding areas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p>By Appointment</p>
                  <p className="text-xs opacity-75">Call for availability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold text-foreground border-b border-border pb-2">Quick Links</h3>
            <nav className="space-y-3">
              {navigationLinks.map(item => <Link key={item.name} to={item.href} className="block text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200">
                  {item.name}
                </Link>)}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold text-foreground border-b border-border pb-2">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {service}
                </li>)}
            </ul>
          </div>
        </div>

        {/* Social Media & Testimonial */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            
            {/* Social Media */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <span className="text-sm font-medium text-foreground">Follow Us:</span>
              <div className="flex space-x-3">
                <a href="https://www.facebook.com/soultrainseatery" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Customer Testimonial */}
            <div className="text-center lg:text-right p-4 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground italic">
                "The Soul Train's Eatery family treated us like their own. From planning to the final plate, every detail was handled with care and love!"
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">— The Williams Family, Charleston Wedding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copyright Bar */}
      <div className="bg-gradient-to-r from-primary to-primary-dark border-t border-primary/20 py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-primary-foreground space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <p>© {currentYear} Soul Train's Eatery. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center space-x-3 text-center sm:text-right">
              <Link to="/privacy-policy" className="hover:text-primary-foreground/80 transition-colors duration-200">Privacy Policy</Link>
              <span className="text-primary-foreground/60">|</span>
              <Link to="/terms-conditions" className="hover:text-primary-foreground/80 transition-colors duration-200">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};