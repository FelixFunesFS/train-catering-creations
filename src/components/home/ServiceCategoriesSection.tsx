import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Heart, 
  Building2, 
  Users, 
  ArrowRight,
  Star,
  CircleCheck,
  Award,
  ChevronDown
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import rubyWaveBg from "@/assets/ruby-wave-bg.webp";

// Import optimized WebP images
import weddingCatering from "@/assets/hero/wedding-catering.webp";
import corporateEvents from "@/assets/hero/corporate-events.webp";
import familyGatherings from "@/assets/hero/family-gatherings.webp";

interface ServiceCategory {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  href: string;
  isPopular?: boolean;
}

export const ServiceCategoriesSection = () => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  // Mobile-only collapsible (under 768px) - tablets show full content
  const isMobileOnly = useMediaQuery("(max-width: 767px)");

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  // Cards animate together as a unified group
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 100 
  });
  const cardsAnimationClass = useAnimationClass('fade-up', cardsVisible);

  const serviceCategories: ServiceCategory[] = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Wedding Catering",
      subtitle: "Your Dream Day",
      description: "Charleston's premier wedding caterer since 2017. We turn your dream day into a flawless celebration with authentic Southern elegance.",
      image: weddingCatering,
      features: ["Custom Menu Planning", "Professional Service", "Elegant Presentation"],
      href: "/request-quote/wedding",
      isPopular: true
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Corporate Events",
      subtitle: "Professional Excellence",
      description: "Impress clients and colleagues with sophisticated catering that reflects your company's commitment to quality.",
      image: corporateEvents,
      features: ["Flexible Scheduling", "Dietary Accommodations", "Professional Setup"],
      href: "/request-quote/regular"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Family Gatherings",
      subtitle: "Comfort & Joy",
      description: "Bring families together with soul food that creates lasting memories and celebrates your heritage.",
      image: familyGatherings,
      features: ["Family-Style Service", "Traditional Recipes", "Generous Portions"],
      href: "/request-quote/regular"
    }
  ];

  const toggleCard = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const isCardExpanded = (index: number) => expandedCards.includes(index);

  const renderCardContent = (service: ServiceCategory, index: number) => {
    const isThirdCard = index === 2;
    const isExpanded = isCardExpanded(index);

    return (
      <Card
        key={index}
        className={`group relative overflow-hidden border-2 border-transparent hover:border-ruby/30 transition-all duration-500 cursor-pointer ${
          isThirdCard ? 'md:col-span-2 lg:col-span-1' : ''
        }`}
      >
        <div className={`${isThirdCard ? 'md:flex md:flex-row lg:block' : ''}`}>
          {/* Image Section */}
          <div className={`relative overflow-hidden ${isThirdCard ? 'md:w-[40%] lg:w-full' : ''}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <OptimizedImage
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Ruby Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-ruby-subtle opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Popular Badge */}
              {service.isPopular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-ruby-primary text-white border-0">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Icon */}
              <div className="absolute top-4 left-4">
                <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 text-white">
                  {service.icon}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`p-4 space-y-4 ${isThirdCard ? 'md:w-[60%] lg:w-full md:flex md:flex-col md:justify-center' : ''}`}>
            <div className="space-y-2">
              <h3 className="text-xl font-elegant font-bold text-foreground group-hover:text-ruby transition-colors">
                {service.title}
              </h3>
              <p className="text-lg font-script text-ruby font-medium">
                {service.subtitle}
              </p>
            </div>

            {/* Mobile-Only Collapsible (phones only, not tablets) */}
            {isMobileOnly ? (
              <Collapsible open={isExpanded} onOpenChange={() => toggleCard(index)}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-ruby hover:text-ruby hover:bg-ruby/10 min-h-[44px] p-0"
                  >
                    <span className="text-sm font-medium">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CircleCheck className="h-4 w-4 text-ruby" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    variant="cta-outline" 
                    size="responsive-compact"
                    asChild
                  >
                    <a href={service.href} className="flex items-center justify-center space-x-2 text-inherit">
                      <span>Get Quote</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              /* Desktop/Tablet - Always visible content */
              <>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CircleCheck className="h-4 w-4 text-ruby" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  variant="cta-outline" 
                  size="responsive-compact"
                  asChild
                >
                  <a href={service.href} className="flex items-center justify-center space-x-2 text-inherit">
                    <span>Get Quote</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <section 
      ref={ref}
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
    >
      {/* Ruby Wave Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${rubyWaveBg})` }}
        aria-hidden="true"
      />
      
      {/* White overlay for text readability */}
      <div className="absolute inset-0 bg-background/85" aria-hidden="true" />
      
      {/* Top edge gradient fade */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10"
        aria-hidden="true"
      />
      
      {/* Bottom edge gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Award className="h-5 w-5 text-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Our Services
            </Badge>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
            Catering Excellence for Every Occasion
          </h2>
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
            20+ Years of Culinary Mastery
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chef Train and Tanya Ward have spent 20+ years perfecting the art of Charleston catering. 
            From Magnolia Avenue to military bases, we've served the Lowcountry with soul, style, and unwavering quality.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div 
          ref={cardsRef}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 ${cardsAnimationClass}`}
        >
          {serviceCategories.map((service, index) => renderCardContent(service, index))}
        </div>

      </div>
    </section>
  );
};
