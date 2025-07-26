import { useState } from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Heart, Award, Users, Calendar } from "lucide-react";
export const LocalConnectionSection = () => {
  const isMobile = useIsMobile();
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    variant: 'slide-up',
    threshold: 0.2,
    triggerOnce: true
  });
  const [currentVenue, setCurrentVenue] = useState(0);
  const charlestonHighlights = [{
    title: "Historic Venues",
    description: "Serving Charleston's most prestigious locations",
    icon: MapPin,
    stat: "50+",
    detail: "Historic venues served"
  }, {
    title: "Community Love",
    description: "Deeply rooted in Charleston hospitality",
    icon: Heart,
    stat: "15",
    detail: "Years serving Charleston"
  }, {
    title: "Local Recognition",
    description: "Award-winning service in the Lowcountry",
    icon: Award,
    stat: "12",
    detail: "Local awards received"
  }, {
    title: "Charleston Families",
    description: "Trusted by generations of local families",
    icon: Users,
    stat: "850+",
    detail: "Local families served"
  }];
  const charlestonVenues = [{
    name: "Historic Downtown",
    description: "Elegant venues in the heart of Charleston",
    image: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
    features: ["Rainbow Row vicinity", "Historic mansions", "Waterfront locations"]
  }, {
    name: "Plantation Estates",
    description: "Grand Southern plantation venues",
    image: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
    features: ["Oak-lined driveways", "Historic gardens", "Antebellum architecture"]
  }, {
    name: "Waterfront Properties",
    description: "Stunning harbor and river views",
    image: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
    features: ["Harbor views", "Sunset ceremonies", "Yacht club venues"]
  }, {
    name: "Garden Districts",
    description: "Intimate settings among Charleston gardens",
    image: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
    features: ["Magnolia gardens", "Courtyard venues", "Historic neighborhoods"]
  }];
  return <section ref={ref} className="py-16 lg:py-24 bg-gradient-pattern-a" aria-label="Charleston local connection">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">Proudly Serving Charleston</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4">
            Rooted in Charleston Tradition
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From the cobblestones of Rainbow Row to the grand plantations of the Lowcountry, 
            we bring authentic Southern hospitality to Charleston's most cherished locations.
          </p>
        </div>

        {/* Charleston Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-16">
          {charlestonHighlights.map((highlight, index) => <NeumorphicCard key={index} level={1} interactive className="p-4 lg:p-6 text-center group hover:neumorphic-card-2 transition-all duration-300">
              <highlight.icon className="h-6 w-6 lg:h-8 lg:w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                {highlight.stat}
              </div>
              
              <div className="text-xs lg:text-sm font-semibold text-primary mb-2">
                {highlight.detail}
              </div>
              
              <h3 className="text-sm lg:text-base font-semibold text-foreground mb-1">
                {highlight.title}
              </h3>
              
              <p className="text-xs lg:text-sm text-muted-foreground leading-tight">
                {highlight.description}
              </p>
            </NeumorphicCard>)}
        </div>

        {/* Charleston Venues Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Mobile: Carousel */}
          {isMobile ? <div className="lg:hidden col-span-full">
              <NeumorphicCard level={2} className="p-4 overflow-hidden">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                  <OptimizedImage src={charlestonVenues[currentVenue].image} alt={charlestonVenues[currentVenue].name} aspectRatio="aspect-video" containerClassName="h-full" className="transition-all duration-500" />
                  
                  {/* Venue Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {charlestonVenues[currentVenue].name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {charlestonVenues[currentVenue].description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {charlestonVenues[currentVenue].features.map((feature, i) => <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>)}
                </div>

                {/* Venue Navigation */}
                <div className="flex justify-center gap-2">
                  {charlestonVenues.map((_, index) => <button key={index} onClick={() => setCurrentVenue(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentVenue ? 'bg-primary' : 'bg-muted'}`} aria-label={`View venue ${index + 1}`} />)}
                </div>
              </NeumorphicCard>
            </div> : (/* Desktop: Grid Layout */
        charlestonVenues.map((venue, index) => {}))}
        </div>

        {/* Community Involvement */}
        <div className="mt-16 text-center">
          <NeumorphicCard level={1} className="p-8 lg:p-12 max-w-4xl mx-auto">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-6" />
            
            <h3 className="text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-4">
              Charleston Community Partners
            </h3>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We're proud to support local Charleston nonprofits, historic preservation societies, 
              and community events that celebrate our city's rich heritage and vibrant future.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">25+</div>
                <div className="text-sm text-muted-foreground">Charity Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">$50K+</div>
                <div className="text-sm text-muted-foreground">Donated Services</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">Historic Venues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Local Sourced</div>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>;
};