
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Users, Award } from "lucide-react";

interface FeaturedServiceCardProps {
  delay?: number;
}

export const FeaturedServiceCard = ({ delay = 0 }: FeaturedServiceCardProps) => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay,
    variant: 'ios-spring'
  });
  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <Link to="/request-quote/wedding" className="block">
      <div
        ref={ref}
        className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card transition-all duration-300 overflow-hidden group cursor-pointer rounded-xl p-4 sm:p-6 relative ${animationClass}`}
      >
        <Badge className="absolute top-4 right-4 bg-gradient-primary text-primary-foreground z-10">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Most Popular
        </Badge>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="relative">
            <OptimizedImage
              src="/lovable-uploads/546d7d1a-7987-4f44-a2d9-668efea60e51.png"
              alt="Elegant Wedding Reception"
              aspectRatio="aspect-[4/3]"
              className="group-hover:scale-105 transition-transform duration-300 rounded-lg"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-3 sm:mb-4">
                Wedding Catering
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                Charleston's most trusted wedding caterer since 2017. Chef Train and Tanya Ward combine 
                20+ years of expertise with family traditions to create personalized menus that honor 
                your love story with authentic Southern elegance.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Custom Menu Planning</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>10-500 Guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Premium Service</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-primary" />
                  <span>5-Star Reviews</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <span className="text-primary hover:text-primary/80 font-semibold group inline-flex items-center gap-2 text-base sm:text-lg">
                Start Your Wedding Quote
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </span>
              <Link
                to="/menu#page-header"
                className="text-muted-foreground hover:text-foreground text-sm underline"
                onClick={(e) => e.stopPropagation()}
              >
                Browse Menu Options
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
