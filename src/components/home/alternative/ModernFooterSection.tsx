import { useState } from "react";
import { Link } from "react-router-dom";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  Star
} from "lucide-react";

export const ModernFooterSection = () => {
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const footerSections = [
    {
      id: "services",
      title: "Our Services",
      links: [
        { label: "Wedding Catering", href: "/wedding-menu" },
        { label: "Corporate Events", href: "/menu" },
        { label: "Private Parties", href: "/request-quote" },
        { label: "Holiday Catering", href: "/menu" }
      ]
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Photo Gallery", href: "/gallery" },
        { label: "Reviews", href: "/reviews" },
        { label: "FAQ", href: "/faq" }
      ]
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-conditions" }
      ]
    }
  ];

  const contactInfo = {
    address: "Charleston, SC",
    phone: "(843) 322-4567",
    email: "info@soultrainseatery.com",
    hours: "Mon-Fri: 8AM-6PM, Sat-Sun: 9AM-4PM"
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" }
  ];

  return (
    <footer className="py-16 lg:py-20 bg-gradient-to-br from-navy via-navy-light to-navy text-navy-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile: Collapsible Sections */}
        {isMobile ? (
          <div className="space-y-6">
            
            {/* Company Info */}
            <NeumorphicCard level={1} className="p-6 bg-navy-light/20 border border-white/10">
              <div className="text-center mb-6">
                <div className="h-12 w-12 mx-auto mb-4">
                  <img 
                    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                    alt="Soul Train's Eatery Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert" 
                  />
                </div>
                <h3 className="text-xl font-elegant font-bold mb-2">Soul Train's Eatery</h3>
                <p className="text-sm text-navy-foreground/80 leading-relaxed">
                  Charleston's premier catering service, bringing Southern hospitality 
                  and culinary excellence to your special occasions.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{contactInfo.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${contactInfo.phone}`} className="text-sm hover:text-primary transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${contactInfo.email}`} className="text-sm hover:text-primary transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">{contactInfo.hours}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 bg-white/10 rounded-lg hover:bg-primary hover:scale-110 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </NeumorphicCard>

            {/* Collapsible Sections */}
            {footerSections.map((section) => (
              <NeumorphicCard key={section.id} level={1} className="overflow-hidden bg-navy-light/20 border border-white/10">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                  aria-expanded={expandedSection === section.id}
                >
                  <h4 className="font-semibold">{section.title}</h4>
                  {expandedSection === section.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {expandedSection === section.id && (
                  <div className="px-4 pb-4 space-y-2 animate-accordion-down">
                    {section.links.map((link, index) => (
                      <Link
                        key={index}
                        to={link.href}
                        className="block text-sm text-navy-foreground/80 hover:text-primary transition-colors py-1"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          
          /* Desktop: Full Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div className="h-16 w-16 mb-4">
                  <img 
                    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                    alt="Soul Train's Eatery Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert" 
                  />
                </div>
                <h3 className="text-2xl font-elegant font-bold mb-4">Soul Train's Eatery</h3>
                <p className="text-navy-foreground/80 leading-relaxed mb-6">
                  Charleston's premier catering service, bringing Southern hospitality 
                  and culinary excellence to your special occasions.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-3 bg-white/10 rounded-lg hover:bg-primary hover:scale-110 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            {footerSections.map((section) => (
              <div key={section.id}>
                <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                <div className="space-y-3">
                  {section.links.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="block text-navy-foreground/80 hover:text-primary transition-colors hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Get In Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Location</div>
                    <div className="text-navy-foreground/80 text-sm">{contactInfo.address}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Phone</div>
                    <a 
                      href={`tel:${contactInfo.phone}`} 
                      className="text-navy-foreground/80 text-sm hover:text-primary transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <a 
                      href={`mailto:${contactInfo.email}`} 
                      className="text-navy-foreground/80 text-sm hover:text-primary transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Hours</div>
                    <div className="text-navy-foreground/80 text-sm">{contactInfo.hours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-sm text-navy-foreground/60 text-center lg:text-left">
              © 2024 Soul Train's Eatery. All rights reserved. Proudly serving Charleston, SC.
            </div>
            
            <div className="flex items-center gap-4 text-sm text-navy-foreground/60">
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-primary fill-current" />
                <span>in Charleston</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-gold fill-current" />
                <span>5-Star Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};