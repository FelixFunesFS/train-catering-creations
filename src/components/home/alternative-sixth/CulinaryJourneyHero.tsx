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
  const stats = [{
    icon: Calendar,
    value: "25+",
    label: "Years"
  }, {
    icon: Users,
    value: "10k+",
    label: "Families Served"
  }, {
    icon: Star,
    value: "50+",
    label: "Venues"
  }, {
    icon: Award,
    value: "100%",
    label: "Family-Owned"
  }];
  const milestones = [{
    year: "1999",
    title: "Soul Train's Eatery Founded",
    description: "Charleston heritage begins"
  }, {
    year: "2005",
    title: "Mobile Catering Launch",
    description: "Bringing flavors to you"
  }, {
    year: "2015",
    title: "Lowcountry Expansion",
    description: "Serving the region"
  }, {
    year: "2024",
    title: "Culinary Innovation",
    description: "Modern meets tradition"
  }];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone(prev => (prev + 1) % milestones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 opacity-30">
        <OptimizedImage src="/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png" alt="Elegant wedding reception setup showcasing Soul Train's Eatery catering expertise" className="w-full h-full object-cover" containerClassName="w-full h-full" />
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_50%)] py-0 px-0 mx-0" />

      <ResponsiveWrapper hasFullWidthCard>
        <div ref={ref} className="relative z-10 pt-8 pb-16">
          {/* Heritage Badge */}
          <div className={`flex justify-center mb-8 ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`}>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/30">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="text-primary font-elegant text-sm font-semibold">Est. 1999 • Charleston Heritage</span>
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
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-elegant font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Soul Train's Eatery
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl font-script text-primary mb-6">
                Charleston's Premier Catering
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Creating unforgettable culinary experiences in Charleston and the Lowcountry since 1999. 
              Let us bring exceptional taste and heartfelt service to your next celebration.
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
            <NeumorphicButton size="lg" className="px-8 py-4 min-h-[44px]" aria-label="Start planning your culinary event with Soul Train's Eatery">
              Get Started Today
            </NeumorphicButton>
            <NeumorphicButton variant="outline" size="lg" className="px-8 py-4 min-h-[44px]" aria-label="Learn more about our Charleston heritage and story">
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