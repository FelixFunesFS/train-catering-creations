import { useState, useEffect } from "react";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { Heart, MapPin, Users, Clock } from "lucide-react";
// Using existing uploaded image for Charleston heritage background

export const CharlestonHeritageHero = () => {
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const milestones = [{
    year: "2002",
    title: "Family Dream Begins",
    description: "Chef Train & Tanya Ward start their Charleston journey"
  }, {
    year: "2005",
    title: "First Rainbow Row Event",
    description: "Catering our first historic Charleston venue"
  }, {
    year: "2010",
    title: "Lowcountry Recognition",
    description: "Becoming Charleston's trusted family caterer"
  }, {
    year: "2024",
    title: "Two Decades Strong",
    description: "Over 20 years of Charleston family traditions"
  }];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone(prev => (prev + 1) % milestones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Charleston Background */}
      <div className="absolute inset-0">
        <OptimizedImage 
          src="/lovable-uploads/a68ac24e-cf0d-4941-9059-568c9b92bebf.png" 
          alt="Elegant Charleston banquet hall with golden accents and sophisticated lighting" 
          containerClassName="w-full h-full" 
          className="object-cover object-center" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ruby-900/10 to-ruby-900/20" />
      </div>

      <ResponsiveWrapper>
        <div ref={ref} className="relative z-10 text-center text-white py-8 md:py-12 lg:py-24" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          
          {/* Heritage Badge */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 mb-6 md:mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
            <span className="text-sm md:text-base font-medium">Charleston Family Legacy Since 2002</span>
          </div>

          {/* Logo and Main Title */}
          <div className="mb-6 md:mb-8">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery Logo - Charleston Heritage Catering" 
              className="h-16 md:h-20 lg:h-24 w-auto mx-auto mb-4 md:mb-6" 
            />
          </div>
          
          <h1 className={`font-elegant text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Soul Train's Eatery
            <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-xl md:text-2xl lg:text-3xl mt-2">
              Charleston Heritage
            </span>
          </h1>

          {/* Story Introduction */}
          <p className={`font-clean text-base md:text-lg lg:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed transition-all duration-700 delay-400 px-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
            Born from a deep love of Southern cooking and a commitment to bringing families together around exceptional food. 
          </p>

          {/* Family Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto mb-8 md:mb-12 px-4 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 md:p-4 border border-white/30 min-h-[120px] md:min-h-auto touch-target">
              <Clock className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">20+</div>
              <div className="text-sm md:text-base opacity-90">Years</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 md:p-4 border border-white/30 min-h-[120px] md:min-h-auto touch-target">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">1000+</div>
              <div className="text-sm md:text-base opacity-90">Families Served</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 md:p-4 border border-white/30 min-h-[120px] md:min-h-auto touch-target">
              <MapPin className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">50+</div>
              <div className="text-sm md:text-base opacity-90">Charleston Venues</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 md:p-4 border border-white/30 min-h-[120px] md:min-h-auto touch-target">
              <Heart className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">100%</div>
              <div className="text-sm md:text-base opacity-90">Family-Owned</div>
            </div>
          </div>

          {/* Interactive Timeline */}
          <div className={`max-w-2xl mx-auto mb-12 transition-all duration-700 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
          </div>

          {/* Heritage CTAs */}
          <div className={`flex flex-col sm:flex-row gap-6 md:gap-4 justify-center items-center px-4 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <NeumorphicButton 
              size="lg" 
              variant="primary" 
              className="w-full sm:w-auto bg-gradient-ruby-primary text-white hover:bg-gradient-ruby-accent shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] min-h-[48px] px-8 py-4 focus-visible-enhanced" 
              aria-label="Learn about our Charleston heritage and family story"
            >
              <Heart className="w-5 h-5" />
              Our Charleston Story
            </NeumorphicButton>
            <NeumorphicButton 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 min-w-[200px] min-h-[48px] px-8 py-4 focus-visible-enhanced" 
              aria-label="Explore our Charleston venue locations and services"
            >
              <MapPin className="w-5 h-5" />
              Charleston Venues
            </NeumorphicButton>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>;
};