import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Award,
  Shield,
  Star,
  Heart
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "Wedding Catering", href: "/wedding-menu" },
    { name: "Corporate Events", href: "/menu?category=corporate" },
    { name: "Private Parties", href: "/menu?category=private" }
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Gallery", href: "/photo-gallery" },
    { name: "Reviews", href: "/reviews" }
  ],
  gallery: [
    { name: "Wedding Gallery", href: "/photo-gallery?category=wedding" },
    { name: "Corporate Gallery", href: "/photo-gallery?category=corporate" },
    { name: "Signature Dishes", href: "/photo-gallery?category=signature" }
  ]
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" }
];

const trustBadges = [
  { icon: Award, text: "5-Star Rated" },
  { icon: Shield, text: "Fully Insured" },
  { icon: Star, text: "Award Winning" }
];

export const AccessibleRubyFooter = () => {
  const isMobile = useIsMobile();
  
  const { ref: footerRef, isVisible: footerVisible, variant: footerVariant } = useScrollAnimation({
    variant: 'fade-up',
    delay: 0
  });

  const footerAnimationClass = useAnimationClass(footerVariant, footerVisible);

  return (
    <footer className="py-12 sm:py-16 md:py-20 bg-gradient-to-t from-ruby-dark via-ruby-primary to-ruby-light text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-ruby-primary/95" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={footerRef} className={footerAnimationClass}>
          <NeumorphicCard level={2} className="bg-white/10 backdrop-blur-sm border-white/20 p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
              
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <h3 className="font-elegant text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
                  Soul Train's
                  <span className="block font-script text-accent-light text-base sm:text-lg md:text-xl">
                    Ruby Elegance
                  </span>
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <a href="tel:+1234567890" className="flex items-center space-x-2 sm:space-x-3 text-white/90 hover:text-white transition-colors duration-300 min-h-[44px]">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">(123) 456-7890</span>
                  </a>
                  <a href="mailto:hello@soultrainseatery.com" className="flex items-center space-x-2 sm:space-x-3 text-white/90 hover:text-white transition-colors duration-300 min-h-[44px]">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">hello@soultrainseatery.com</span>
                  </a>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-white/90 min-h-[44px]">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Los Angeles, CA</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-elegant text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Services</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.services.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-300 block py-1 min-h-[44px] flex items-center">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-elegant text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Company</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-300 block py-1 min-h-[44px] flex items-center">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery */}
              <div>
                <h4 className="font-elegant text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Gallery</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.gallery.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm sm:text-base text-white/80 hover:text-white transition-colors duration-300 block py-1 min-h-[44px] flex items-center">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <badge.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links & Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/20">
              <div className="flex items-center space-x-4 sm:space-x-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-white/80">
                  © 2024 Soul Train's Eatery. All rights reserved.
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Made with <Heart className="w-3 h-3 inline-block mx-1" /> in Los Angeles
                </p>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </footer>
  );
};