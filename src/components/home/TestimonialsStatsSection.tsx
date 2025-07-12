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
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-card shadow-card rounded-lg mx-4 sm:mx-6 lg:mx-8 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Statistics Side */}
          <div className="space-y-8 lg:space-y-12">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-6">
                Proven Excellence
              </h2>
              <p className="text-lg text-muted-foreground">
                Numbers that speak to our commitment to exceptional catering
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card border-border hover:shadow-elegant transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 lg:p-8 text-center">
                    <stat.icon className="h-10 w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-4 lg:mb-6" />
                    <div className="text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-4">
                      {stat.number}
                    </div>
                    <p className="text-sm lg:text-base text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Review Side */}
          <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-card">
            <Quote className="h-10 w-10 lg:h-12 lg:w-12 text-primary mb-6" />
            <blockquote className="text-lg lg:text-xl font-elegant text-foreground leading-relaxed mb-8">
              "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
            </blockquote>
            
            <div className="flex items-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 lg:w-6 lg:h-6 text-primary">⭐</div>
              ))}
            </div>
            
            <div className="border-t border-border pt-6">
              <p className="text-lg font-semibold text-foreground">
                Sarah & Michael's Wedding
              </p>
              <p className="text-base text-muted-foreground">
                Charleston, SC
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};