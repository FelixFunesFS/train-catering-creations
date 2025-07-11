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
    <section className="py-40 bg-background border-t border-border/30">
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
                <Card key={index} className="bg-card border-border hover:shadow-elegant transition-all duration-300 hover:scale-105">
                  <CardContent className="p-16 text-center">
                    <stat.icon className="h-12 w-12 text-primary mx-auto mb-8" />
                    <div className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                      {stat.number}
                    </div>
                    <p className="text-base text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Review Side */}
          <div className="bg-card rounded-2xl p-16 lg:p-20 border border-border shadow-card">
            <Quote className="h-12 w-12 text-primary mb-8" />
            <blockquote className="text-xl lg:text-2xl font-script text-foreground leading-relaxed mb-10">
              "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information."
            </blockquote>
            
            <div className="flex items-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 text-primary">⭐</div>
              ))}
            </div>
            
            <div className="border-t border-border pt-8">
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