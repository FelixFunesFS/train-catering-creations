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
  return <section className="py-16 lg:py-20 bg-muted/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-stretch">
          {/* Statistics Side */}
          <div ref={statsRef} className={`space-y-6 lg:space-y-8 ${statsAnimationClass}`}>
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-elegant text-foreground mb-6 text-fade-up">
                Proven Excellence
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground text-fade-up-delay-1">It’s not just about how many we’ve served—it’s how well. Our reputation is built on flavor, service, and results.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {stats.map((stat, index) => <Card key={index} className="bg-card border-border shadow-elegant hover:shadow-elevated transition-all duration-200 hover:scale-105 group">
                  <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                    <stat.icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-accent mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-xl sm:text-2xl lg:text-3xl font-elegant text-foreground mb-4">
                      {stat.number}
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Review Side */}
          <div ref={reviewRef} className={`bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-elegant hover:shadow-elevated transition-all duration-200 hover:scale-105 group flex flex-col justify-between h-full ${reviewAnimationClass}`}>
            <Quote className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-accent mb-6 group-hover:scale-110 transition-transform duration-200" />
            <blockquote className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-8">
              "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
            </blockquote>
            <div>
              <div className="flex items-center space-x-2 mb-6">
                {[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent">⭐</div>)}
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
        </div>
      </div>
    </section>;
};