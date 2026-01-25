import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import buffetWingsOutdoor from "@/assets/gallery/buffet-wings-outdoor.jpg";

export const FAQVisualBreak = () => {
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
        style={{ backgroundImage: `url(${buffetWingsOutdoor})` }}
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
            We're Here to Help
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Our team is ready to help with personalized answers. Reach out directly 
            and let us assist with your catering needs.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="cta" size="responsive-lg">
              <Link to="/request-quote#page-header" className="flex items-center gap-2">
                Request Quote
              </Link>
            </Button>
            <Button asChild variant="cta-white" size="responsive-lg">
              <a href="sms:8439700265" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Text Us
              </a>
            </Button>
          </div>
          
          {/* Secondary Contact */}
          <p className="text-muted-foreground/80 mt-6 text-sm">
            Or call us directly at{" "}
            <a href="tel:8439700265" className="text-primary hover:underline font-medium">
              (843) 970-0265
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
