import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Heart, Building2, Users, ChefHat, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";

export const ServicesDiscoverySection = () => {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });

  const { getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 150,
    baseDelay: 300,
    variant: 'slide-up',
    threshold: 0.1
  });

  const [expandedService, setExpandedService] = useState(0); // Wedding expanded by default

  const services = [
    {
      id: "weddings",
      title: "Wedding Celebrations",
      description: "Your dream wedding deserves our signature touch",
      fullDescription: "From intimate ceremonies to grand receptions, we create unforgettable culinary experiences that reflect your unique love story. Our wedding specialists work closely with you to design custom menus that delight your guests and create lasting memories.",
      icon: Heart,
      image: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
      features: ["Custom menu design", "Professional service staff", "Elegant presentation", "Dietary accommodations"],
      ctaText: "Plan Your Wedding",
      ctaLink: "/wedding-menu"
    },
    {
      id: "corporate",
      title: "Corporate Events",
      description: "Professional catering that impresses",
      fullDescription: "Elevate your business events with our sophisticated catering solutions. From board meetings to company celebrations, we provide professional service and exceptional cuisine that reflects your company's standards of excellence.",
      icon: Building2,
      image: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
      features: ["Executive lunch service", "Conference catering", "Office parties", "Client entertainment"],
      ctaText: "Corporate Solutions",
      ctaLink: "/menu"
    },
    {
      id: "private",
      title: "Private Parties",
      description: "Intimate gatherings with personal service",
      fullDescription: "Transform your special occasions into extraordinary experiences. Whether it's a milestone birthday, anniversary, or family reunion, our team creates the perfect atmosphere with delicious food and attentive service.",
      icon: Users,
      image: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
      features: ["Personalized menus", "In-home service", "Special dietary needs", "Event coordination"],
      ctaText: "Plan Your Party",
      ctaLink: "/request-quote"
    },
    {
      id: "specialty",
      title: "Specialty Services",
      description: "Unique culinary experiences",
      fullDescription: "Explore our specialized offerings including cooking classes, wine pairings, holiday catering, and custom culinary experiences designed to create memorable moments for you and your guests.",
      icon: ChefHat,
      image: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
      features: ["Cooking classes", "Wine pairings", "Holiday catering", "Custom experiences"],
      ctaText: "Explore Services",
      ctaLink: "/menu"
    }
  ];

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? -1 : index);
  };

  return (
    <section 
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-pattern-c"
      aria-label="Our catering services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Charleston Heritage Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-2">
            Charleston's Finest
          </h2>
          <div className="text-2xl lg:text-3xl xl:text-4xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
            Catering Services
          </div>
          <div className="w-24 h-1 bg-gradient-ruby-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From intimate gatherings to grand celebrations, we bring culinary excellence 
            and Southern hospitality to every Charleston occasion
          </p>
        </div>

        {/* Mobile: Accordion Layout */}
        {isMobile ? (
          <div className="space-y-4">
            {services.map((service, index) => (
              <NeumorphicCard 
                key={service.id}
                level={1}
                className={`overflow-hidden transition-all duration-300 ${getItemClassName(index)}`}
                style={getItemStyle(index)}
              >
                {/* Service Header - Always Visible */}
                <button
                  onClick={() => toggleService(index)}
                  className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg"
                  aria-expanded={expandedService === index}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{service.title}</h3>
                      <p className="text-sm font-script bg-gradient-ruby-primary bg-clip-text text-transparent">{service.description}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      expandedService === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {expandedService === index && (
                  <div className="px-4 pb-4 space-y-4 animate-accordion-down">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <OptimizedImage
                        src={service.image}
                        alt={service.title}
                        aspectRatio="aspect-video"
                        containerClassName="h-full"
                        className="object-cover"
                      />
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {service.fullDescription}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild size="sm" className="w-full mt-4">
                      <Link to={service.ctaLink} className="flex items-center justify-center gap-2">
                        {service.ctaText}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          
          /* Desktop: Grid with Hover Previews */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <NeumorphicCard
                key={service.id}
                level={1}
                interactive
                className={`group p-6 lg:p-8 hover:neumorphic-card-2 transition-all duration-300 ${getItemClassName(index)}`}
                style={getItemStyle(index)}
              >
                {/* Service Icon & Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-elegant font-bold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Service Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                  <OptimizedImage
                    src={service.image}
                    alt={service.title}
                    aspectRatio="aspect-video"
                    containerClassName="h-full"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="w-12 h-0.5 bg-white/80 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Service Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.fullDescription}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Link to={service.ctaLink} className="flex items-center justify-center gap-2">
                    {service.ctaText}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </NeumorphicCard>
            ))}
          </div>
        )}

        {/* Explore All Services CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Button asChild size="lg" variant="outline">
            <Link to="/menu" className="flex items-center gap-2">
              Explore All Services
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};