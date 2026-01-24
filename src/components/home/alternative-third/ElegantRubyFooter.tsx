import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  ChefHat,
  Heart,
  Award
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "Wedding Catering", href: "/wedding-menu" },
    { name: "Corporate Events", href: "/menu" },
    { name: "Private Parties", href: "/request-quote" },
    { name: "Holiday Catering", href: "/menu" }
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/about" },
    { name: "Meet the Team", href: "/about" },
    { name: "Testimonials", href: "/reviews" }
  ],
  gallery: [
    { name: "Photo Gallery", href: "/gallery" },
    { name: "Wedding Gallery", href: "/gallery?category=wedding" },
    { name: "Corporate Gallery", href: "/gallery?category=corporate" },
    { name: "Signature Dishes", href: "/gallery?category=signature" }
  ]
};

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/soultrainseatery", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" }
];

const trustBadges = [
  { icon: Award, text: "Award Winning" },
  { icon: Heart, text: "5-Star Rated" },
  { icon: ChefHat, text: "Licensed & Insured" }
];

export const ElegantRubyFooter = () => {
  const { ref: footerRef, isVisible: footerVisible, variant: footerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const footerAnimationClass = useAnimationClass(footerVariant, footerVisible);

  return (
    <footer ref={footerRef} className={`relative bg-background ${footerAnimationClass}`}>
      {/* Ruby Accent Border */}
      <div className="h-1 bg-gradient-primary" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <NeumorphicCard level={2} className="overflow-hidden">
          <div className="p-8 lg:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 mb-4 bg-ruby/10 rounded-full">
                <ChefHat className="w-4 h-4 mr-2 text-ruby" />
                <span className="text-ruby text-sm font-medium">Ruby Elegance Catering</span>
              </div>
              
              <h3 className="font-elegant text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Let's Create Something <span className="font-script text-ruby">Beautiful Together</span>
              </h3>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ready to elevate your next event with exceptional culinary experiences? 
                We're here to make your vision a delicious reality.
              </p>
            </div>

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <h4 className="font-elegant text-lg font-bold text-foreground mb-4">
                  Get in Touch
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Phone className="w-4 h-4 text-ruby" />
                    <a href="tel:+1234567890" className="hover:text-ruby transition-colors duration-300">
                      (123) 456-7890
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Mail className="w-4 h-4 text-ruby" />
                    <a href="mailto:events@rubyelegance.com" className="hover:text-ruby transition-colors duration-300">
                      events@rubyelegance.com
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-ruby" />
                    <span>Greater Metro Area</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Clock className="w-4 h-4 text-ruby" />
                    <span>Mon-Fri 9AM-6PM</span>
                  </div>
                </div>
              </div>

              {/* Services Links */}
              <div>
                <h4 className="font-elegant text-lg font-bold text-foreground mb-4">
                  Our Services
                </h4>
                <ul className="space-y-2">
                  {footerLinks.services.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-muted-foreground hover:text-ruby transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-elegant text-lg font-bold text-foreground mb-4">
                  Company
                </h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-muted-foreground hover:text-ruby transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery Links */}
              <div>
                <h4 className="font-elegant text-lg font-bold text-foreground mb-4">
                  Gallery
                </h4>
                <ul className="space-y-2">
                  {footerLinks.gallery.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-muted-foreground hover:text-ruby transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8 py-6 border-y border-border">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-ruby/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-ruby" />
                    </div>
                    <span className="text-sm font-medium">{badge.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links & Copyright */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-ruby/10 flex items-center justify-center text-ruby hover:bg-ruby hover:text-white transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-muted-foreground text-sm">
                  © 2024 Ruby Elegance Catering. All rights reserved.
                </p>
                <div className="flex items-center justify-center sm:justify-end space-x-4 mt-2">
                  <a href="/privacy" className="text-xs text-muted-foreground hover:text-ruby transition-colors duration-300">
                    Privacy Policy
                  </a>
                  <span className="text-xs text-muted-foreground">•</span>
                  <a href="/terms" className="text-xs text-muted-foreground hover:text-ruby transition-colors duration-300">
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </footer>
  );
};