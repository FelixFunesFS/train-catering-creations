import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useParallaxEffect } from "@/hooks/useParallaxEffect";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronRight, ChefHat, ArrowDown, Star, Play, Pause, ChevronLeft } from "lucide-react";

export const MobileFirstHero = () => {
  const isMobile = useIsMobile();
  
  // Story/Image state management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const { ref: heroRef, isVisible: heroVisible, variant: heroVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0,
    triggerOnce: false
  });
  
  const { ref: titleRef, isVisible: titleVisible, variant: titleVariant } = useScrollAnimation({ 
    variant: 'scale-fade', 
    delay: isMobile ? 200 : 300 
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    variant: 'bounce-in', 
    delay: isMobile ? 400 : 600 
  });

  const { ref: parallaxRef, style: parallaxStyle } = useParallaxEffect({ 
    speed: isMobile ? 0.1 : 0.3, 
    direction: 'up' 
  });

  const heroAnimationClass = useAnimationClass(heroVariant, heroVisible);
  const titleAnimationClass = useAnimationClass(titleVariant, titleVisible);
  const ctaAnimationClass = useAnimationClass(ctaVariant, ctaVisible);
  
  // Auto-advance functionality for stories/images
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, isMobile ? 4000 : 6000); // 4s mobile, 6s desktop
    
    return () => clearInterval(interval);
  }, [isPlaying, isMobile]);
  
  // Touch handlers for mobile stories
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStart(e.touches[0].clientX);
  }, [isMobile]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next image
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      } else {
        // Swipe right - previous image
        setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      }
    }
    setTouchStart(null);
  }, [touchStart, isMobile]);
  
  const togglePlayPause = () => setIsPlaying(!isPlaying);
  

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
      ref={heroRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      aria-label="Hero section"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={heroImages[currentImageIndex].src}
          alt={heroImages[currentImageIndex].alt}
          containerClassName="h-full w-full"
          className="object-cover transition-all duration-1000 ease-in-out"
          style={!isMobile ? parallaxStyle : {}}
          priority={currentImageIndex === 0}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-primary opacity-60" />
      </div>
      
      {/* Mobile: IG Stories Progress Bars */}
      {isMobile && (
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  index === currentImageIndex ? 'animate-pulse' : ''
                } ${index < currentImageIndex ? 'w-full' : index === currentImageIndex ? 'w-3/4' : 'w-0'}`}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Desktop: Image Indicators */}
      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Story Controls (Mobile) */}
      {isMobile && (
        <div className="absolute top-16 right-4 z-20 flex gap-2">
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
        </div>
      )}
      {/* Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex items-center justify-center">
        <div className={heroAnimationClass}>
          {/* Category Badge with current image info */}
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-6 sm:mb-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-white" />
            <span className="text-white text-xs sm:text-sm font-medium">
              {isMobile ? heroImages[currentImageIndex].title : 'Culinary Excellence'}
            </span>
          </div>

          {/* Enhanced Hero Title */}
          <div ref={titleRef} className={titleAnimationClass}>
            <h1 className="font-elegant leading-tight mb-4 sm:mb-6">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-1 sm:mb-2">
                Soul Train's
              </span>
              <span className="block font-script text-accent-light text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-1 sm:mb-2 leading-relaxed">
                Ruby Elegance
              </span>
              <span className="block text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
                Catering
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-2">
              {isMobile ? (
                <>
                  <span className="block font-script text-accent-light">
                    {heroImages[currentImageIndex].category} • {heroImages[currentImageIndex].title}
                  </span>
                  <span className="block mt-2 text-sm">
                    Swipe for more culinary showcases
                  </span>
                </>
              ) : (
                <>
                  Where culinary artistry meets elegant presentation. 
                  <span className="block mt-1 sm:mt-2 font-script text-base sm:text-xl md:text-2xl lg:text-3xl text-accent-light">
                    Creating unforgettable dining experiences
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Touch-Optimized CTA Buttons */}
          <div ref={ctaRef} className={`flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6 px-4 ${ctaAnimationClass}`}>
            <Button 
              asChild 
              variant="cta-white" 
              size="responsive-lg"
              className="w-full sm:w-auto min-w-[240px] sm:min-w-[200px] min-h-[48px] shadow-elevated hover:shadow-glow-strong transition-all duration-300 text-base sm:text-lg font-semibold"
            >
              <Link to="/request-quote#page-header" className="flex items-center justify-center space-x-2">
                <ChevronRight className="w-5 h-5" />
                <span>Book Your Event</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="responsive-lg"
              className="w-full sm:w-auto min-w-[240px] sm:min-w-[200px] min-h-[48px] border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg font-semibold"
            >
              <Link to="/gallery#page-header" className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5" />
                <span>View Gallery</span>
              </Link>
            </Button>
          </div>
          
          {/* Mobile-Optimized Trust Indicator */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
            <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium px-2">
              ✨ Over 500 successful events • 5-star rated • Fully licensed & insured
            </p>
          </div>
        </div>
      </div>

      
      {/* Touch Instructions (Mobile) */}
      {isMobile && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="text-center">
            <p className="text-white/60 text-xs mb-2">Tap sides or swipe to navigate</p>
            <div className="flex justify-center space-x-4">
              <ChevronLeft className="w-4 h-4 text-white/40 animate-pulse" />
              <ChevronRight className="w-4 h-4 text-white/40 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Scroll Indicator */}
      {!isMobile && (
        <div className="absolute bottom-6 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-2">
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 animate-bounce" />
            <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white/60 rounded-full mt-1 sm:mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};