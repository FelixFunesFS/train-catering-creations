import { Calendar, Utensils, Trophy, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection, AnimatedGrid } from "@/components/ui/animated-section";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
const StatCard = ({ number, label, icon: Icon }: { number: string; label: string; icon: any }) => {
  const numericValue = parseInt(number.replace(/[^\d]/g, ''));
  const suffix = number.replace(/[\d]/g, '');
  const { elementRef, displayValue } = useAnimatedNumber(numericValue, 2000, suffix);
  
  return (
    <Card className="bg-card border-border hover:shadow-elegant transition-all duration-200 hover:scale-105 group hover-lift">
      <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
        <div 
          ref={elementRef as React.RefObject<HTMLDivElement>}
          className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-4 animate-number-count"
        >
          {displayValue}
        </div>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">
          {label}
        </p>
      </CardContent>
    </Card>
  );
};

export const TestimonialsStatsSection = () => {
  const stats = [{
    number: "750+",
    label: "Events Catered",
    icon: Calendar
  }, {
    number: "8,200+",
    label: "Meals Served",
    icon: Utensils
  }];
  return <section className="py-6 md:py-8 lg:py-10 bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-200 rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4 md:my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-stretch">
          {/* Statistics Side */}
          <div className="space-y-6 lg:space-y-8">
            <AnimatedSection animation="fade-in-left" delay={0}>
              <div className="text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-6">
                  Proven Excellence
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  Numbers that speak to our commitment to exceptional catering
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedGrid 
              className="grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-12"
              staggerDelay={200}
            >
              {stats.map((stat, index) => 
                <StatCard 
                  key={index} 
                  number={stat.number} 
                  label={stat.label} 
                  icon={stat.icon} 
                />
              )}
            </AnimatedGrid>
          </div>

          {/* Review Side */}
          <AnimatedSection animation="fade-in-right" delay={200}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-elegant hover:shadow-glow transition-all duration-200 hover:scale-105 group flex flex-col justify-between h-full hover-lift">
              <Quote className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
              <blockquote className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-8">
                "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
              </blockquote>
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary">⭐</div>)}
                </div>
                
                <div className="border-t border-border pt-6">
                  <p className="text-base sm:text-lg font-semibold text-foreground">
                    Sarah & Michael's Wedding
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Charleston, SC
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>;
};