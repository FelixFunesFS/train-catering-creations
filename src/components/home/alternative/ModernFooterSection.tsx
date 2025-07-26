import { useState } from "react";
import { Link } from "react-router-dom";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, Instagram, Facebook, Twitter, Heart, Star } from "lucide-react";
export const ModernFooterSection = () => {
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };
  const footerSections = [{
    id: "services",
    title: "Our Services",
    links: [{
      label: "Wedding Catering",
      href: "/wedding-menu"
    }, {
      label: "Corporate Events",
      href: "/menu"
    }, {
      label: "Private Parties",
      href: "/request-quote"
    }, {
      label: "Holiday Catering",
      href: "/menu"
    }]
  }, {
    id: "company",
    title: "Company",
    links: [{
      label: "About Us",
      href: "/about"
    }, {
      label: "Photo Gallery",
      href: "/gallery"
    }, {
      label: "Reviews",
      href: "/reviews"
    }, {
      label: "FAQ",
      href: "/faq"
    }]
  }, {
    id: "legal",
    title: "Legal",
    links: [{
      label: "Privacy Policy",
      href: "/privacy-policy"
    }, {
      label: "Terms & Conditions",
      href: "/terms-conditions"
    }]
  }];
  const contactInfo = {
    address: "Charleston, SC",
    phone: "(843) 322-4567",
    email: "info@soultrainseatery.com",
    hours: "Mon-Fri: 8AM-6PM, Sat-Sun: 9AM-4PM"
  };
  const socialLinks = [{
    icon: Instagram,
    href: "#",
    label: "Instagram"
  }, {
    icon: Facebook,
    href: "#",
    label: "Facebook"
  }, {
    icon: Twitter,
    href: "#",
    label: "Twitter"
  }];
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Soul Train Seatery
            </h3>
            <p className="text-muted-foreground mb-6">
              Creating unforgettable culinary experiences with passion, creativity, and local charm in Charleston.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.id} className="md:col-span-1">
              {isMobile ? (
                <div>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left py-2"
                  >
                    <h4 className="font-semibold text-foreground">{section.title}</h4>
                    {expandedSection === section.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSection === section.id && (
                    <ul className="mt-2 space-y-2">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.href}
                            className="text-muted-foreground hover:text-primary transition-colors text-sm"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{contactInfo.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{contactInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{contactInfo.hours}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1 mb-4 md:mb-0">
            <span>© 2024 Soul Train Seatery. Made with</span>
            <Heart className="h-4 w-4 text-primary fill-current" />
            <span>in Charleston, SC</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>4.9/5 Customer Rating</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};