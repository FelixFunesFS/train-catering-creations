import { OptimizedImage } from "@/components/ui/optimized-image";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MapPin, Star, Calendar, Users, Phone, Mail, ExternalLink } from "lucide-react";

export const CharlestonFeaturedVenue = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const featuredVenue = {
    name: "108 W Main Wedding + Event Venue",
    type: "Moncks Corner Venue",
    location: "Moncks Corner, SC 29461",
    phone: "843-856-7177",
    email: "108wmain@gmail.com",
    website: "https://www.108wmain.com/",
    description: "Where your love story begins under ancient oaks",
    events: "45+ events",
    rating: 5.0,
    specialties: ["Historic Weddings", "Corporate Events", "Family Celebrations"],
    image: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    fullDescription: "A historic two-story house under a lush oak canopy, 108 W Main offers an intimate setting where your love story unfolds. With elegant spaces, luxurious bridal suites, and a beautifully landscaped ceremony garden, this neutral canvas adapts to your unique vision. On your special day, it's exclusively yours."
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
      <ResponsiveWrapper>
        
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-12 lg:mb-16">
          <h2 className={`font-elegant text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Charleston's Most
            <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-2xl md:text-4xl lg:text-5xl mt-2">
              Cherished Location
            </span>
          </h2>
          <p className={`font-clean text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Experience the magic of Charleston's most treasured venue, where history meets 
            culinary excellence in perfect Southern harmony.
          </p>
        </div>

        {/* Featured Location Card */}
        <SectionContentCard className="overflow-hidden max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-ruby-primary" />
                <span className="text-sm font-medium text-ruby-primary uppercase tracking-wider">
                  Featured Venue
                </span>
              </div>
              
              <h3 className="font-elegant text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
                {featuredVenue.name}
              </h3>
              
              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                {featuredVenue.description}
              </p>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {featuredVenue.fullDescription}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ruby-primary" />
                  <span className="text-sm font-medium">{featuredVenue.events}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-ruby-primary fill-current" />
                  <span className="text-sm font-medium">{featuredVenue.rating}/5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-ruby-primary" />
                  <a 
                    href={`tel:${featuredVenue.phone}`}
                    className="text-sm font-medium hover:text-ruby-primary transition-colors"
                  >
                    {featuredVenue.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ruby-primary" />
                  <a 
                    href={`mailto:${featuredVenue.email}`}
                    className="text-sm font-medium hover:text-ruby-primary transition-colors"
                  >
                    {featuredVenue.email}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {featuredVenue.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-ruby-primary/10 text-ruby-primary rounded-full text-sm font-medium border border-ruby-primary/20"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <NeumorphicButton 
                variant="primary" 
                className="bg-gradient-ruby-primary text-white hover:bg-gradient-ruby-accent focus-visible-enhanced inline-flex items-center gap-2"
                onClick={() => window.open(featuredVenue.website, '_blank')}
                aria-label="Learn more about 108 W Main Wedding + Event Venue"
              >
                Learn More
                <ExternalLink className="w-4 h-4" />
              </NeumorphicButton>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <OptimizedImage
                  src={featuredVenue.image}
                  alt={`${featuredVenue.name} venue in Charleston`}
                  aspectRatio="aspect-[4/3]"
                  className="rounded-lg shadow-lg"
                />
                
                {/* Charleston Badge Overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-ruby-primary rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-foreground">Moncks Corner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionContentCard>

        {/* Charleston Experience Highlight */}
        <div className="text-center mt-12">
          <div className="max-w-2xl mx-auto">
            <p className="font-script text-lg md:text-xl text-ruby-primary mb-2">
              "Where every meal tells the story of Charleston"
            </p>
            <p className="text-sm text-muted-foreground">
              Experience authentic Lowcountry hospitality at the Holy City's most beloved location
            </p>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};