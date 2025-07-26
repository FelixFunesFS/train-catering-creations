import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";

export const JourneyFooter = () => {
  const contactInfo = [
    {
      icon: Phone,
      label: "Call Us",
      value: "(843) 555-0123",
      href: "tel:+18435550123"
    },
    {
      icon: Mail,
      label: "Email Us", 
      value: "hello@soultrainseatery.com",
      href: "mailto:hello@soultrainseatery.com"
    },
    {
      icon: MapPin,
      label: "Visit Us",
      value: "Charleston, SC & Lowcountry",
      href: "#location"
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Mon-Fri: 8AM-6PM",
      href: "#hours"
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#facebook", label: "Facebook" },
    { icon: Instagram, href: "#instagram", label: "Instagram" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" }
  ];

  const footerLinks = {
    "Services": [
      "Corporate Catering",
      "Wedding Events",
      "Private Parties",
      "Special Occasions"
    ],
    "Company": [
      "About Us",
      "Our Story",
      "Meet the Team",
      "Testimonials"
    ],
    "Resources": [
      "Menu Planning",
      "Event Gallery",
      "FAQs",
      "Contact Us"
    ]
  };

  return (
    <footer className="bg-gradient-to-b from-primary/5 to-navy-900 text-white">
      <ResponsiveWrapper>
        {/* Main Footer Content */}
        <div className="py-16 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="text-2xl font-elegant font-bold">Soul Train's Eatery</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-script text-primary/80">
              Your Culinary Journey Awaits
            </h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              Charleston's premier catering service. 8 years of exceptional service backed by 20+ years of culinary mastery, 
              bringing extraordinary experiences to your special moments throughout the Lowcountry.
            </p>
          </div>

          {/* Quick Contact Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <contact.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-white/60">{contact.label}</div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {contact.value}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Links and Newsletter */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-elegant font-semibold text-lg mb-4 text-primary/80">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-white/70 hover:text-primary transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter Signup */}
            <div>
              <h4 className="font-elegant font-semibold text-lg mb-4 text-primary/80">
                Stay Connected
              </h4>
              <p className="text-white/70 text-sm mb-4">
                Get the latest updates on our culinary journeys and special offers.
              </p>
              <div className="space-y-3">
                <NeumorphicButton 
                  className="w-full min-h-[44px]"
                  aria-label="Subscribe to Soul Train's Eatery newsletter for updates and offers"
                >
                  Join Our Journey
                </NeumorphicButton>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-sm text-center md:text-left">
              © 2024 Soul Train's Eatery. All rights reserved. 
              <span className="hidden md:inline"> | </span>
              <br className="md:hidden" />
              Crafted with <Heart className="w-4 h-4 inline text-primary" fill="currentColor" /> in Charleston, SC
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-white/60 hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-white/60 hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-white/60 hover:text-primary transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    </footer>
  );
};