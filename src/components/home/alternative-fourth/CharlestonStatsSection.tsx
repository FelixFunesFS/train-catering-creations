import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Clock, Users, MapPin, Heart } from "lucide-react";

export const CharlestonStatsSection = () => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const stats = [
    {
      icon: Clock,
      value: "20+",
      label: "Years",
      desc: "Years of Charleston catering experience"
    },
    {
      icon: Users,
      value: "1000+",
      label: "Families Served",
      desc: "Families served across Charleston"
    },
    {
      icon: MapPin,
      value: "50+",
      label: "Charleston Venues",
      desc: "Charleston venues catered"
    },
    {
      icon: Heart,
      value: "100%",
      label: "Family-Owned",
      desc: "Family-owned and operated business"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <header className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-4">
              Our Charleston Legacy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Two decades of serving Charleston families with authentic Southern hospitality
            </p>
          </header>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-4xl mx-auto" role="region" aria-label="Soul Train's Eatery Performance Statistics">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" 
                tabIndex={0} 
                role="group" 
                aria-label={stat.desc}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <stat.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};