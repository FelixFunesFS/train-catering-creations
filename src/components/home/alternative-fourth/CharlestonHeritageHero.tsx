import { useState, useEffect } from "react";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heart, MapPin, Users, Clock, ChevronDown } from "lucide-react";

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

  // Scroll to next section handler
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="Soul Train's Eatery Charleston Heritage Hero Section"
    >
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      {/* Charleston Background - Full Width */}
      <div className="absolute inset-0">
        <OptimizedImage 
          src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png" 
          alt="Historic Rainbow Row Charleston colorful Georgian houses - iconic Charleston heritage district with pastel-colored historic buildings" 
          containerClassName="w-full h-full" 
          className="object-cover object-center" 
          priority 
        />
      </div>

      {/* Content Container - Mobile First */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8 md:py-12 lg:py-16">
        <div 
          ref={ref} 
          className="text-center text-white motion-reduce:transform-none motion-reduce:transition-none"
        >
          
          {/* Heritage Badge with Enhanced Accessibility */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full backdrop-blur-md border transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
            }}
            role="banner"
            aria-label="Charleston Family Legacy Badge"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" aria-hidden="true" />
            <span className="text-sm sm:text-base font-medium">Charleston Family Legacy Since 2002</span>
          </div>

          {/* Logo and Main Title with Semantic HTML */}
          <header className="mb-6 sm:mb-8 md:mb-10">
            <div className="mb-4 sm:mb-6">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="Soul Train's Eatery Logo" 
                className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto mx-auto" 
                loading="eager"
              />
            </div>
            
            <h1 
              className={`font-elegant font-bold mb-4 sm:mb-6 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                fontSize: 'clamp(1.875rem, 5vw, 4.5rem)',
                lineHeight: '1.1',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)'
              }}
            >
              Soul Train's Eatery
              <span 
                className="block font-script text-primary mt-2"
                style={{ 
                  fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                  color: 'hsl(var(--primary))'
                }}
              >
                Charleston Heritage
              </span>
            </h1>
          </header>

          {/* Story Introduction with Enhanced Readability */}
          <p 
            className={`font-clean max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed transition-all duration-700 delay-400 px-4 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              lineHeight: '1.6',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              borderRadius: '0.75rem',
              padding: 'clamp(1rem, 3vw, 1.5rem)'
            }}
          >
            Born from a deep love of Southern cooking and a commitment to bringing families together around exceptional food.
          </p>

          {/* Family Stats - Mobile-First Grid */}
          <div 
            className={`grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4 transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            role="region"
            aria-label="Soul Train's Eatery Statistics"
          >
            {[
              { icon: Clock, value: "20+", label: "Years", desc: "Years of Charleston catering experience" },
              { icon: Users, value: "1000+", label: "Families Served", desc: "Families served across Charleston" },
              { icon: MapPin, value: "50+", label: "Charleston Venues", desc: "Charleston venues catered" },
              { icon: Heart, value: "100%", label: "Family-Owned", desc: "Family-owned and operated business" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="rounded-lg p-4 sm:p-6 border border-white/30 min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center text-center focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                }}
                tabIndex={0}
                role="group"
                aria-label={stat.desc}
              >
                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary mx-auto mb-2" aria-hidden="true" />
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Interactive Timeline Placeholder */}
          <div 
            className={`max-w-2xl mx-auto mb-8 sm:mb-12 transition-all duration-700 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              borderRadius: '0.75rem',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">Our Charleston Journey</h3>
              <div className="text-sm sm:text-base opacity-90">
                {milestones[currentMilestone].year} - {milestones[currentMilestone].title}
              </div>
              <div className="text-xs sm:text-sm opacity-75 mt-1">
                {milestones[currentMilestone].description}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {milestones.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentMilestone ? 'bg-primary' : 'bg-white/40'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Heritage CTAs with Enhanced Accessibility */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 transition-all duration-700 delay-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <NeumorphicButton 
              size="lg" 
              variant="primary" 
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] min-h-[48px] px-6 py-3 sm:px-8 sm:py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent" 
              aria-label="Learn about our Charleston heritage and family story"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              Our Charleston Story
            </NeumorphicButton>
            <NeumorphicButton 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/25 min-w-[200px] min-h-[48px] px-6 py-3 sm:px-8 sm:py-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent" 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
              aria-label="Explore our Charleston venue locations and services"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              Charleston Venues
            </NeumorphicButton>
          </div>

          {/* Enhanced Scroll Indicator */}
          <button
            onClick={scrollToNext}
            className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent animate-bounce"
            aria-label="Scroll to next section"
            style={{ animation: 'bounce 2s infinite' }}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center items-start p-1">
              <ChevronDown className="w-4 h-4 animate-pulse" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};