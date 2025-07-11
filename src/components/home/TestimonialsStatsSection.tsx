import { Calendar, Utensils, Trophy, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialsStatsSection = () => {
  const stats = [
    {
      number: "750+",
      label: "Events Catered",
      icon: Calendar
    },
    {
      number: "8,200+",
      label: "Meals Served",
      icon: Utensils
    }
  ];

  return (
    <section className="py-40 bg-gradient-hero border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Statistics Side */}
          <div className="space-y-16">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-8">
                Proven Excellence
              </h2>
              <p className="text-lg text-muted-foreground">
                Numbers that speak to our commitment to exceptional catering
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in" style={{animationDelay: `${index * 200}ms`}}>
                  <CardContent className="p-16 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
                    <div className="relative z-10">
                      <stat.icon className="h-12 w-12 text-primary mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                      <div className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">
                        {stat.number}
                      </div>
                      <p className="text-base text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Review Side */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-16 lg:p-20 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-500 group animate-fade-in" style={{animationDelay: '400ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <Quote className="h-12 w-12 text-primary mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              <blockquote className="text-lg lg:text-xl font-elegant text-foreground leading-relaxed mb-10 group-hover:text-primary transition-colors duration-300">
                "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
              </blockquote>
              
              <div className="flex items-center space-x-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 text-primary hover:scale-125 transition-transform duration-200" style={{transitionDelay: `${i * 50}ms`}}>⭐</div>
                ))}
              </div>
              
              <div className="border-t border-white/20 pt-8">
                <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  Sarah & Michael's Wedding
                </p>
                <p className="text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
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