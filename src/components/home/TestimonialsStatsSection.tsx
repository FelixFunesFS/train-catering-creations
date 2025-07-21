import { Calendar, Utensils, Trophy, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

export const TestimonialsStatsSection = () => {
  const {
    ref: statsRef,
    isVisible: statsVisible,
    variant: statsVariant
  } = useScrollAnimation({
    delay: 0,
    variant: 'elastic'
  });
  const {
    ref: reviewRef,
    isVisible: reviewVisible,
    variant: reviewVariant
  } = useScrollAnimation({
    delay: 300,
    variant: 'elastic'
  });
  const statsAnimationClass = useAnimationClass(statsVariant, statsVisible);
  const reviewAnimationClass = useAnimationClass(reviewVariant, reviewVisible);
  
  const stats = [{
    number: "750+",
    label: "Events Catered",
    icon: Calendar
  }, {
    number: "8,200+",
    label: "Meals Served",
    icon: Utensils
  }];

  return (
    <section className="bg-muted/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-10 lg:py-12 xl:py-16">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-stretch">
          {/* Statistics Side */}
          <div ref={statsRef} className={`space-y-4 sm:space-y-6 lg:space-y-8 ${statsAnimationClass}`}>
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight text-fade-up">Proven Performance</h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed text-fade-up-delay-1">It's not just about how many we've served—it's how well. Our reputation is built on flavor, service, and results.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="neumorphic-card-2 hover:neumorphic-card-3 transition-all duration-200 hover:scale-105 group rounded-lg">
                  <div className="p-4 sm:p-6 lg:p-8 text-center">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-primary mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-3 sm:mb-4">
                      {stat.number}
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Side */}
          <div ref={reviewRef} className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-200 hover:scale-105 group flex flex-col justify-between h-full ${reviewAnimationClass}`}>
            <Quote className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200" />
            <blockquote className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
            </blockquote>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-primary">⭐</div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 sm:pt-6">
                <p className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground">
                  Sarah & Michael's Wedding
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  Charleston, SC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
