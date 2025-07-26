import { useState, useEffect, useCallback } from "react";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heart, ChevronDown, Star, Users, Award, Calendar } from "lucide-react";
export const CulinaryJourneyHero = () => {
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    threshold: 0.1,
    variant: "fade-up"
  });
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const stats = [
    { icon: Calendar, value: "8+", label: "Years in Business" },
    { icon: Users, value: "20+", label: "Years Experience" },
    { icon: Star, value: "10k+", label: "Families Served" },
    { icon: Award, value: "100%", label: "Family-Owned" }
  ];

  const milestones = [
    { year: "2016", title: "Soul Train's Eatery Founded", description: "Beginning our culinary journey with 20+ years of expertise" },
    { year: "2018", title: "Mobile Catering Excellence", description: "Expanding to serve events across the Charleston region" },
    { year: "2020", title: "Lowcountry Expansion", description: "Growing our presence throughout South Carolina" },
    { year: "2024", title: "Culinary Innovation & Growth", description: "Continuing to elevate Southern cuisine for modern celebrations" }
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone(prev => (prev + 1) % milestones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative min-h-screen bg-gradient-to-br from-navy/90 to-background overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 opacity-80">
        <OptimizedImage src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png" alt="Elegant rustic venue with dramatic lighting showcasing Soul Train's Eatery catering ambiance" className="w-full h-full object-cover object-center" containerClassName="w-full h-full" />
      </div>
      
      {/* Subtle Dark Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      
      {/* Ruby Red Accent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ruby/5 to-ruby/15" />

      <ResponsiveWrapper hasFullWidthCard>
        <div ref={ref} className="relative z-10 pt-8 pb-16">
          {/* Heritage Badge */}
          <div className={`flex justify-center mb-8 ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`}>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/30">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="text-primary font-elegant text-sm font-semibold">Est. 2016 • 8 Years Strong</span>
            </div>
          </div>

          {/* Logo & Main Title */}
          <div className={`text-center mb-12 ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{
          animationDelay: '200ms'
        }}>
            <div className="mb-6 flex flex-col items-center">
              {/* Logo */}
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20">
                <OptimizedImage src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Official Logo - Charleston Heritage Catering" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" aspectRatio="aspect-square" />
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-elegant font-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Soul Train's Eatery
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl font-script text-primary mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Charleston's Premier Catering
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Creating unforgettable culinary experiences in Charleston and the Lowcountry since 2016. 
              8 years of exceptional service backed by 20+ years of culinary mastery, 
              bringing heartfelt service to your celebrations.
            </p>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{
          animationDelay: '400ms'
        }}>
            {stats.map((stat, index) => <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-elegant font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>)}
          </div>

          {/* Interactive Timeline */}
          

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{
          animationDelay: '800ms'
        }}>
            <NeumorphicButton size="lg" className="px-8 py-4 min-h-[48px] text-base sm:text-lg" aria-label="Start planning your culinary event with Soul Train's Eatery">
              Get Started Today
            </NeumorphicButton>
            <NeumorphicButton variant="outline" size="lg" className="px-8 py-4 min-h-[48px] text-base sm:text-lg border-ruby text-ruby hover:bg-ruby hover:text-white" aria-label="Learn more about our Charleston heritage and story">
              Explore Our Story
            </NeumorphicButton>
          </div>

          {/* Scroll Indicator */}
          <div className={`flex justify-center mt-16 ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{
          animationDelay: '1000ms'
        }}>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    </div>;
};