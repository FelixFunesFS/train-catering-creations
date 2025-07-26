import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Quote, Star, Users, Calendar, Award } from "lucide-react";

export const TrustIndicatorsSection = () => {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });
  
  const { getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: 3,
    staggerDelay: 200,
    baseDelay: 300,
    variant: 'scale-fade',
    threshold: 0.1
  });
  
  const animationClass = useAnimationClass('fade-up', isVisible);
  
  // Animated counters
  const [animatedStats, setAnimatedStats] = useState({
    years: 0,
    events: 0,
    clients: 0
  });

  const finalStats = {
    years: 15,
    events: 2500,
    clients: 850
  };

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        
        setAnimatedStats({
          years: Math.floor(finalStats.years * easeOut),
          events: Math.floor(finalStats.events * easeOut),
          clients: Math.floor(finalStats.clients * easeOut)
        });

        if (step >= steps) {
          setAnimatedStats(finalStats);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const testimonials = [
    {
      text: "Soul Train's catering made our wedding absolutely perfect. The food was incredible and the service was flawless.",
      author: "Sarah & Michael",
      event: "Wedding Reception",
      rating: 5
    },
    {
      text: "Professional, reliable, and the food always exceeds expectations. They've catered multiple corporate events for us.",
      author: "Charleston Chamber of Commerce",
      event: "Corporate Events",
      rating: 5
    },
    {
      text: "The attention to detail and Southern hospitality really sets them apart. Our guests are still talking about the food!",
      author: "Jennifer L.",
      event: "Private Party",
      rating: 5
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Calendar,
      value: animatedStats.years,
      suffix: "+",
      label: "Years in Business",
      description: "Serving Charleston"
    },
    {
      icon: Users,
      value: animatedStats.events,
      suffix: "+",
      label: "Events Catered",
      description: "Memorable occasions"
    },
    {
      icon: Award,
      value: animatedStats.clients,
      suffix: "+",
      label: "Happy Clients",
      description: "Five-star reviews"
    }
  ];

  return (
    <section 
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-br from-ruby-light/10 to-ruby-dark/20"
      aria-label="Trust indicators and testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-2">
            Trusted Excellence
          </h2>
          <div className="text-2xl lg:text-3xl xl:text-4xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
            In Every Experience
          </div>
          <div className="w-24 h-1 bg-gradient-ruby-primary mx-auto mb-6 rounded-full" />
        </div>
        
        {/* Mobile: Vertical Stack */}
        {isMobile ? (
          <div className={`space-y-8 ${animationClass}`}>
            
            {/* Stats Row for Mobile */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <NeumorphicCard 
                  key={index} 
                  level={2} 
                  className={`p-4 text-center bg-white/5 backdrop-blur-sm ${getItemClassName(index)}`}
                  style={getItemStyle(index)}
                >
                  <stat.icon className="h-5 w-5 text-ruby-primary mx-auto mb-2" />
                  <div className="text-xl font-bold bg-gradient-ruby-primary bg-clip-text text-transparent">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {stat.label}
                  </div>
                </NeumorphicCard>
              ))}
            </div>

            {/* Single Testimonial Carousel for Mobile */}
            <NeumorphicCard level={3} className="p-6 bg-white/5 backdrop-blur-sm">
              <div className="text-center">
                <Quote className="h-8 w-8 text-ruby-primary mx-auto mb-4 opacity-60" />
                <blockquote className="text-base text-foreground mb-4 leading-relaxed font-clean">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex justify-center mb-3">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent-light fill-current" />
                  ))}
                </div>
                
                <cite className="text-sm font-semibold font-elegant text-ruby-primary">
                  {testimonials[currentTestimonial].author}
                </cite>
                <div className="text-xs text-muted-foreground font-script">
                  {testimonials[currentTestimonial].event}
                </div>
              </div>

              {/* Testimonial Indicators */}
              <div className="flex justify-center mt-4 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-ruby-primary' : 'bg-muted'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </NeumorphicCard>
          </div>
        ) : (
          
          /* Desktop: Horizontal Layout */
          <div className={`${animationClass}`}>
            
            {/* Stats Bar for Desktop */}
            <div className="grid grid-cols-3 gap-8 lg:gap-12 mb-16">
              {stats.map((stat, index) => (
                <NeumorphicCard 
                  key={index} 
                  level={2} 
                  interactive
                  className={`p-6 lg:p-8 text-center group hover:neumorphic-card-3 transition-all duration-300 bg-white/5 backdrop-blur-sm ${getItemClassName(index)}`}
                  style={getItemStyle(index)}
                >
                  <stat.icon className="h-8 w-8 lg:h-10 lg:w-10 text-ruby-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl lg:text-4xl font-bold font-elegant bg-gradient-ruby-primary bg-clip-text text-transparent mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1 font-elegant">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground font-script">
                    {stat.description}
                  </div>
                </NeumorphicCard>
              ))}
            </div>

            {/* Testimonials Grid for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <NeumorphicCard 
                  key={index}
                  level={2}
                  interactive
                  className={`p-6 lg:p-8 group hover:neumorphic-card-3 transition-all duration-300 bg-white/5 backdrop-blur-sm ${getItemClassName(index)}`}
                  style={getItemStyle(index)}
                >
                  <Quote className="h-8 w-8 text-ruby-primary mb-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <blockquote className="text-foreground mb-6 leading-relaxed font-clean">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-accent-light fill-current" />
                    ))}
                  </div>
                  
                  <div>
                    <cite className="font-semibold font-elegant text-ruby-primary block">
                      {testimonial.author}
                    </cite>
                    <div className="text-sm text-muted-foreground font-script">
                      {testimonial.event}
                    </div>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};