import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { MapPin, Star, Calendar, Users } from "lucide-react";
// Using existing uploaded images for Charleston venues

export const LowcountryLocationShowcase = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const { ref: locationsRef, getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: 6,
    staggerDelay: 150,
    variant: 'scale-fade'
  });

  const [selectedLocation, setSelectedLocation] = useState(0);

  const venues = [
    {
      name: "Rainbow Row Historic District",
      type: "Historic Charleston",
      description: "Cobblestone charm meets Southern elegance",
      events: "45+ events",
      rating: 5.0,
      specialties: ["Historic Weddings", "Corporate Events", "Family Celebrations"],
      image: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png"
    },
    {
      name: "Lowcountry Plantation Estates",
      type: "Grand Plantation",
      description: "Spanish moss and timeless Southern grace",
      events: "30+ events",
      rating: 5.0,
      specialties: ["Wedding Receptions", "Anniversary Celebrations", "Estate Events"],
      image: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png"
    },
    {
      name: "Charleston Harbor Waterfront",
      type: "Waterfront Venue",
      description: "Harbor views with coastal Southern cuisine",
      events: "25+ events",
      rating: 4.9,
      specialties: ["Seafood Events", "Corporate Retreats", "Sunset Dinners"],
      image: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png"
    },
    {
      name: "Historic Downtown Mansions",
      type: "Antebellum Estate",
      description: "Antebellum architecture and garden settings",
      events: "35+ events",
      rating: 5.0,
      specialties: ["Garden Parties", "Intimate Weddings", "Historic Tours"],
      image: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png"
    },
    {
      name: "Charleston Country Clubs",
      type: "Private Club",
      description: "Exclusive venues with championship golf courses",
      events: "20+ events",
      rating: 4.8,
      specialties: ["Golf Tournaments", "Member Events", "Business Dinners"],
      image: "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png"
    },
    {
      name: "Folly Beach Oceanfront",
      type: "Beach Venue",
      description: "Ocean breeze and Lowcountry seafood traditions",
      events: "15+ events",
      rating: 4.9,
      specialties: ["Beach Weddings", "Seafood Festivals", "Sunset Events"],
      image: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
      <ResponsiveWrapper>
        
        {/* Section Header with Logo */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery - Charleston Venues"
              className="h-16 md:h-20 w-auto mx-auto mb-4"
            />
          </div>
          
          <h2 className={`font-elegant text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Charleston's Most
            <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-2xl md:text-4xl lg:text-5xl mt-2">
              Cherished Locations
            </span>
          </h2>
          <p className={`font-clean text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            From the cobblestones of Rainbow Row to the grand plantations of the Lowcountry, 
            we bring authentic Southern hospitality to Charleston's most treasured venues.
          </p>
        </div>

        {/* Featured Location */}
        <div className="mb-16">
          <SectionContentCard className="overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
                    Featured Venue
                  </span>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
                  {venues[selectedLocation].name}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {venues[selectedLocation].description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-sm">{venues[selectedLocation].events}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-red-600 fill-current" />
                    <span className="text-sm">{venues[selectedLocation].rating}/5.0</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {venues[selectedLocation].specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <OptimizedImage
                  src={venues[selectedLocation].image}
                  alt={`${venues[selectedLocation].name} venue in Charleston`}
                  aspectRatio="aspect-[4/3]"
                  className="rounded-lg"
                />
              </div>
            </div>
          </SectionContentCard>
        </div>

        {/* Venue Grid */}
        <div ref={locationsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, index) => (
            <SectionContentCard
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${getItemClassName(index)} ${
                selectedLocation === index ? 'ring-2 ring-red-600/50 shadow-lg' : ''
              }`}
              style={getItemStyle(index)}
              onClick={() => setSelectedLocation(index)}
              interactive
            >
              <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                <OptimizedImage
                  src={venue.image}
                  alt={`${venue.name} Charleston venue`}
                  containerClassName="w-full h-full"
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  {venue.type}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-red-600 fill-current" />
                  <span className="text-xs">{venue.rating}</span>
                </div>
              </div>
              
              <h3 className="font-playfair text-lg font-bold mb-2">{venue.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">{venue.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">{venue.events}</span>
                </div>
                <span className="text-xs font-medium text-red-600">
                  View Details →
                </span>
              </div>
            </SectionContentCard>
          ))}
        </div>

        {/* Charleston Map CTA */}
        <div className="text-center mt-16">
          <SectionContentCard className="max-w-2xl mx-auto">
            <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-playfair text-2xl font-bold mb-4">
              Know Every Charleston Venue
            </h3>
            <p className="text-muted-foreground mb-6">
              With over 20 years in Charleston, we have the insider knowledge and relationships 
              to make your event perfect at any Lowcountry location.
            </p>
            <NeumorphicButton 
              variant="primary" 
              className="bg-gradient-ruby-primary text-white hover:bg-gradient-ruby-accent focus-visible-enhanced"
              aria-label="View all Charleston venue locations and details"
            >
              Explore All Venues
            </NeumorphicButton>
          </SectionContentCard>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};