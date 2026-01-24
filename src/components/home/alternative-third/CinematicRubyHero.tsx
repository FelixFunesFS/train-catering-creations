import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useParallaxEffect } from "@/hooks/useParallaxEffect";
import { Phone, Calendar, ChefHat } from "lucide-react";

export const CinematicRubyHero = () => {
  const { ref: heroRef, isVisible: heroVisible, variant: heroVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0,
    triggerOnce: false
  });
  
  const { ref: titleRef, isVisible: titleVisible, variant: titleVariant } = useScrollAnimation({ 
    variant: 'scale-fade', 
    delay: 300 
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    variant: 'bounce-in', 
    delay: 600 
  });

  const { ref: parallaxRef, style: parallaxStyle } = useParallaxEffect({ 
    speed: 0.3, 
    direction: 'up' 
  });

  const heroAnimationClass = useAnimationClass(heroVariant, heroVisible);
  const titleAnimationClass = useAnimationClass(titleVariant, titleVisible);
  const ctaAnimationClass = useAnimationClass(ctaVariant, ctaVisible);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Parallax Background Layer */}
      <div 
        ref={parallaxRef}
        style={parallaxStyle}
        className="absolute inset-0 bg-gradient-to-br from-ruby-light/20 to-ruby-dark/40 opacity-60"
      />
      
      {/* Ruby Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/5 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 md:w-36 md:h-36 rounded-full bg-white/10 animate-pulse delay-1000" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={heroRef} className={heroAnimationClass}>
          {/* Elegant Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <ChefHat className="w-4 h-4 mr-2 text-white" />
            <span className="text-white text-sm font-medium">Culinary Excellence</span>
          </div>
          
          {/* Hero Title */}
          <div ref={titleRef} className={titleAnimationClass}>
            <h1 className="font-elegant text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="block mb-2">Ruby</span>
              <span className="block font-script text-accent-light mb-2">Elegance</span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Catering</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Where culinary artistry meets elegant presentation. 
              <span className="block mt-2 font-script text-xl sm:text-2xl md:text-3xl text-accent-light">
                Creating unforgettable dining experiences
              </span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div ref={ctaRef} className={`flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 ${ctaAnimationClass}`}>
            <Button 
              asChild 
              variant="cta-white" 
              size="responsive-lg"
              className="min-w-[200px] shadow-elevated hover:shadow-glow-strong transition-all duration-300"
            >
              <a href="/request-quote" className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Book Your Event</span>
              </a>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="responsive-lg"
              className="min-w-[200px] border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <a href="tel:+1234567890" className="flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Call Now</span>
              </a>
            </Button>
          </div>
          
          {/* Trust Indicator */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm sm:text-base font-medium">
              ✨ Over 500 successful events • 5-star rated • Fully licensed & insured
            </p>
          </div>
        </div>
      </div>
      
    </section>
  );
};