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
    <footer className="bg-gradient-subtle border-t border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="font-elegant text-xl font-bold text-ruby-primary mb-4">
              Soul Train's Ruby Elegance
            </h3>
            <p className="font-clean text-muted-foreground mb-4">
              Crafting unforgettable culinary experiences in Charleston with elegance and soul.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-ruby-primary/10 flex items-center justify-center hover:bg-ruby-primary/20 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-ruby-primary" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.id} className="col-span-1">
              <h4 className="font-elegant text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="font-clean text-muted-foreground hover:text-ruby-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="font-clean text-sm text-muted-foreground">
            © 2024 Soul Train's Ruby Elegance Catering. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <MapPin className="w-4 h-4 text-ruby-primary" />
            <span className="font-clean text-sm text-muted-foreground">{contactInfo.address}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};