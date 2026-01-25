import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";
import menuHeroBg from "@/assets/menu-hero-bg.png";

export const SimpleMenuHeader = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  return (
    <section className="py-8 lg:py-12 relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${menuHeroBg})` }}
        aria-hidden="true"
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/85" />
      
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 lg:h-20 bg-gradient-to-b from-background to-transparent z-10" />
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 lg:h-20 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div ref={ref} className={useAnimationClass(variant, isVisible)}>
          <div className="text-center space-y-3">
            {/* Badge + Icon */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Utensils className="h-5 w-5 text-ruby" />
              <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
                Our Menu
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
              Our Catering Menu
            </h1>
            
            {/* Script subtitle (matching home page sections) */}
            <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
              Crafted with Soul, Seasoned with Love
            </p>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Authentic Southern cuisine for weddings, corporate events, and special celebrations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
