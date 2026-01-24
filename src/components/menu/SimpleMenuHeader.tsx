import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

export const SimpleMenuHeader = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={useAnimationClass(variant, isVisible)}>
          <div className="text-center space-y-3">
            {/* Badge + Logo + Icon (matching home page pattern) */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="" 
                className="h-6 w-6 object-contain"
              />
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
