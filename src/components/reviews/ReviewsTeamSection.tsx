import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import teamWesternGroup from "@/assets/gallery/team-western-group.jpg";

export const ReviewsTeamSection = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "scale-fade",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "scale-fade", delay: 0 },
  });

  return (
    <section 
      ref={ref}
      className={`relative w-full overflow-hidden ${useAnimationClass(variant, isVisible)}`}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${teamWesternGroup})` }}
      />
      
      {/* White Overlay - 85% per design standards */}
      <div className="absolute inset-0 bg-background/85" />
      
      {/* Top Gradient Fade */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
      
      {/* Content */}
      <div className="relative z-20 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-ruby font-script text-lg sm:text-xl mb-2">
            Our Family
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-4">
            The Faces Behind Your Perfect Event
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 max-w-2xl mx-auto">
            From planning to the final plate, our dedicated team brings Southern hospitality 
            and professional care to every event we cater.
          </p>
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" />
              View Our Gallery
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
