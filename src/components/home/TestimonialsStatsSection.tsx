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
    <section className="py-24 bg-gradient-to-br from-foreground via-foreground to-muted-foreground">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Statistics Side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-4">
                Proven Excellence
              </h2>
              <p className="text-xl text-primary-foreground opacity-90">
                Numbers that speak to our commitment to exceptional catering
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-glow">
                  <CardContent className="p-8 text-center">
                    <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-5xl lg:text-6xl font-bold text-primary-foreground mb-2 font-elegant">
                      {stat.number}
                    </div>
                    <p className="text-lg text-primary-foreground font-medium opacity-90">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Review Side */}
          <div className="bg-white/10 rounded-2xl p-8 lg:p-12 border border-white/20">
            <Quote className="h-12 w-12 text-primary mb-6" />
            <blockquote className="text-2xl lg:text-3xl font-script text-primary-foreground leading-relaxed mb-8">
              "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
            </blockquote>
            
            <div className="flex items-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 text-primary">⭐</div>
              ))}
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <p className="text-xl font-semibold text-primary-foreground">
                Sarah & Michael's Wedding
              </p>
              <p className="text-lg text-primary-foreground opacity-75">
                Charleston, SC
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};