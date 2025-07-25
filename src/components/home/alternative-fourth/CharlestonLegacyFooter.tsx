import { Heart, Phone, MapPin, Clock, Mail, Facebook, Instagram, Utensils, Award } from "lucide-react";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";

export const CharlestonLegacyFooter = () => {
  const quickLinks = [
    { name: "Our Charleston Story", href: "#story" },
    { name: "Family Recipes", href: "#recipes" },
    { name: "Charleston Venues", href: "#venues" },
    { name: "Event Gallery", href: "#gallery" },
    { name: "Community Stories", href: "#testimonials" },
    { name: "Plan Your Event", href: "#booking" }
  ];

  const services = [
    { name: "Wedding Celebrations", href: "#weddings" },
    { name: "Corporate Events", href: "#corporate" },
    { name: "Family Gatherings", href: "#family" },
    { name: "Historic Venues", href: "#historic" },
    { name: "Private Chef Service", href: "#private" },
    { name: "Cooking Classes", href: "#classes" }
  ];

  const charlestonVenues = [
    "Rainbow Row",
    "Boone Hall Plantation",
    "Magnolia Plantation",
    "Charleston Harbor",
    "Historic Downtown",
    "Folly Beach"
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-foreground text-white">
      <ResponsiveWrapper>
        <div className="py-16 lg:py-20">
          
          {/* Heritage Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-red-400" />
              <span className="text-red-400 font-medium uppercase tracking-wider text-sm">
                Charleston Family Legacy Since 2002
              </span>
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            
            <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4">
              Soul Train's Eatery
              <span className="block font-dancing text-red-400 text-xl md:text-3xl mt-2">
                Charleston Heritage
              </span>
            </h2>
            
            <p className="text-white/80 max-w-2xl mx-auto text-lg">
              From the cobblestones of Rainbow Row to the grand plantations of the Lowcountry, 
              we bring authentic Southern hospitality to Charleston's most cherished locations.
            </p>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Contact & Legacy */}
            <div className="lg:col-span-1">
              <h3 className="font-playfair text-xl font-bold mb-6">Get in Touch</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Call Our Family</p>
                    <a href="tel:+18435550123" className="text-white/80 hover:text-red-400 transition-colors duration-200">
                      (843) 555-0123
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <a href="mailto:info@soultrainseatery.com" className="text-white/80 hover:text-red-400 transition-colors duration-200">
                      info@soultrainseatery.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Charleston, SC</p>
                    <p className="text-white/80 text-sm">
                      Serving the entire Lowcountry
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Event Planning</p>
                    <p className="text-white/80 text-sm">
                      Monday - Sunday<br />
                      Available for consultations
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-playfair text-xl font-bold mb-6">Our Story</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/80 hover:text-red-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-playfair text-xl font-bold mb-6">Services</h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.href}
                      className="text-white/80 hover:text-red-400 transition-colors duration-200 text-sm"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Charleston Venues */}
            <div>
              <h3 className="font-playfair text-xl font-bold mb-6">Charleston Venues</h3>
              <ul className="space-y-3 mb-6">
                {charlestonVenues.map((venue, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{venue}</span>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-sm">20+ Years</span>
                </div>
                <p className="text-white/80 text-xs">
                  Trusted by Charleston's finest venues and most cherished families
                </p>
              </div>
            </div>
          </div>

          {/* Family Heritage Banner */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Utensils className="w-6 h-6 text-red-400" />
                <span className="font-dancing text-xl text-red-400">Chef Train & Chef Tanya Ward</span>
                <Utensils className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-white/80 max-w-3xl mx-auto">
                "Our family has been blessed to serve Charleston's families for over two decades. 
                Every event is an opportunity to create lasting memories and honor the traditions 
                that make Charleston special."
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-white/60 text-sm">
                  © 2024 Soul Train's Eatery. All rights reserved.
                </p>
                <p className="text-white/60 text-sm">
                  Proudly serving Charleston families since 2002
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-white/60 hover:text-red-400 transition-colors duration-200">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/60 hover:text-red-400 transition-colors duration-200">
                  Terms of Service
                </a>
                <a href="#" className="text-white/60 hover:text-red-400 transition-colors duration-200">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    </footer>
  );
};