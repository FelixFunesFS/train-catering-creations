import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useParallaxEffect } from "@/hooks/useParallaxEffect";
import { useIsMobile } from "@/hooks/use-mobile";
import { Phone, Calendar, ChefHat, ArrowDown } from "lucide-react";

export const MobileCinematicRubyHero = () => {
  const isMobile = useIsMobile();
  
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Optimized Parallax Background Layer */}
      <div 
        ref={parallaxRef}
        style={!isMobile ? parallaxStyle : {}}
        className="absolute inset-0 bg-gradient-to-br from-ruby-light/20 to-ruby-dark/40 opacity-60"
      />
      
      {/* Ruby Gradient Overlay - Mobile Optimized */}
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      
      {/* Touch-Friendly Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-full bg-white/5 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 lg:w-36 lg:h-36 rounded-full bg-white/10 animate-pulse delay-1000" />
      
      {/* Main Content - Mobile First */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={heroRef} className={heroAnimationClass}>
          {/* Mobile-Optimized Badge */}
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-6 sm:mb-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-white" />
            <span className="text-white text-xs sm:text-sm font-medium">Culinary Excellence</span>
          </div>
          
          {/* Enhanced Mobile-First Hero Title */}
          <div ref={titleRef} className={titleAnimationClass}>
            <h1 className="font-elegant leading-tight mb-4 sm:mb-6">
              {/* Mobile: 2xl, Tablet: 4xl, Desktop: 6xl, Large: 8xl */}
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
              Where culinary artistry meets elegant presentation. 
              <span className="block mt-1 sm:mt-2 font-script text-base sm:text-xl md:text-2xl lg:text-3xl text-accent-light">
                Creating unforgettable dining experiences
              </span>
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
              <a href="/request-quote" className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Book Your Event</span>
              </a>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="responsive-lg"
              className="w-full sm:w-auto min-w-[240px] sm:min-w-[200px] min-h-[48px] border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg font-semibold"
            >
              <a href="tel:+1234567890" className="flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Call Now</span>
              </a>
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
      
      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center space-y-2">
          <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 animate-bounce" />
          <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white/60 rounded-full mt-1 sm:mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};