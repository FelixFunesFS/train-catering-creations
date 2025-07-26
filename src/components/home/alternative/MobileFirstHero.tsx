import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { UtensilsCrossed, Heart, Star, ChevronRight } from "lucide-react";

export const MobileFirstHero = () => {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });
  
  const animationClass = useAnimationClass('fade-up', isVisible);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const fullText = "Charleston's Most Cherished";

  // Typewriter effect
  useEffect(() => {
    if (isVisible) {
      let index = 0;
      const timer = setInterval(() => {
        setTypewriterText(fullText.slice(0, index));
        index++;
        if (index > fullText.length) {
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  // Auto-advance carousel for mobile
  useEffect(() => {
    if (isMobile) {
      const timer = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isMobile]);

  const heroImages = [
    {
      src: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
      alt: "Elegant tiered dessert display",
      title: "Elegant Catering",
      category: "weddings"
    },
    {
      src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
      alt: "Artisanal grazing board",
      title: "Grazing Tables",
      category: "corporate"
    },
    {
      src: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
      alt: "Wedding reception venue",
      title: "Wedding Receptions", 
      category: "private"
    },
    {
      src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
      alt: "Professional buffet setup",
      title: "Corporate Events",
      category: "buffet"
    }
  ];

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/30"
      aria-label="Hero section"
    >
      {/* Mobile-First Layout */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 max-w-7xl mx-auto w-full">
        
        {/* Content Section - Mobile First */}
        <div className={`px-4 sm:px-6 lg:px-8 pt-8 pb-6 lg:py-16 flex flex-col justify-center ${animationClass}`}>
          
          {/* Brand Icons - Mobile */}
          <div className="flex justify-center lg:justify-start mb-6 lg:mb-8">
            <div className="flex items-center gap-4 p-4 lg:p-0">
              <div className="lg:hidden flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-primary" aria-label="Quality catering" />
                <Heart className="h-5 w-5 text-primary" aria-label="Made with love" />
                <Star className="h-5 w-5 text-primary" aria-label="Excellence" />
              </div>
              
              {/* Desktop Logo */}
              <div className="hidden lg:block">
                <div className="h-16 w-16 relative">
                  <img 
                    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                    alt="Soul Train's Eatery Logo" 
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charleston Heritage Heading */}
          <div className="text-center lg:text-left mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight mb-2">
              {typewriterText}
              <span className="animate-pulse">|</span>
            </h1>
            
            <div className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
              Catering Experience
            </div>
            
            <div className="w-16 lg:w-24 h-1 bg-gradient-ruby-primary mx-auto lg:mx-0 mb-4 rounded-full" />
            
            {/* Mobile-Optimized Tagline */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-clean leading-relaxed max-w-lg mx-auto lg:mx-0">
              {isMobile 
                ? "Where culinary artistry meets Southern hospitality" 
                : "Where culinary artistry meets Southern hospitality in Charleston's most distinguished catering experience"
              }
            </p>
          </div>

          {/* Mobile CTA Buttons - Always Visible */}
          <div className="flex flex-col sm:flex-row lg:flex-row gap-3 lg:gap-4 px-2 sm:px-0">
            <Button asChild size={isMobile ? "lg" : "lg"} className="w-full sm:flex-1 lg:w-auto lg:min-w-[160px] min-h-[48px] text-base font-semibold">
              <Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">
                Request Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size={isMobile ? "lg" : "lg"} className="w-full sm:flex-1 lg:w-auto lg:min-w-[160px] min-h-[48px] text-base font-semibold">
              <Link to="/gallery#page-header" className="flex items-center justify-center gap-2">
                View Gallery
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Visual Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8 lg:py-16 flex items-center">
          
          {/* Mobile: Single Image Carousel */}
          <div className="block lg:hidden w-full">
            <NeumorphicCard level={2} className="p-3 overflow-hidden">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <OptimizedImage
                  src={heroImages[currentImageIndex].src}
                  alt={heroImages[currentImageIndex].alt}
                  aspectRatio="aspect-[4/3]"
                  containerClassName="h-full"
                  className="transition-all duration-500"
                  priority
                />
                
                {/* Image Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-elegant font-semibold text-lg mb-1">
                    {heroImages[currentImageIndex].title}
                  </h3>
                  <div className="w-12 h-0.5 bg-white/80 rounded-full" />
                </div>

                {/* Carousel Indicators */}
                <div className="absolute top-4 right-4 flex gap-1">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-4 w-full h-[500px] xl:h-[600px]">
            {heroImages.map((image, index) => (
              <NeumorphicCard
                key={index}
                level={1}
                interactive
                className={`group p-3 overflow-hidden transition-all duration-300 hover:neumorphic-card-2 ${
                  index === 0 ? 'col-span-2' : index === 1 ? 'row-span-2' : ''
                } ${index < 2 ? 'block' : 'hidden xl:block'}`}
              >
                <div className="relative h-full rounded-xl overflow-hidden">
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    aspectRatio="aspect-video"
                    containerClassName="h-full"
                    className="group-hover:scale-105 transition-transform duration-300"
                    priority={index < 2}
                  />
                  
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-elegant font-semibold text-base mb-1">
                        {image.title}
                      </h3>
                      <div className="w-8 h-0.5 bg-white/80 rounded-full" />
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        </div>
      </div>

      {/* Progressive Enhancement Indicator */}
      <div className="hidden lg:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};