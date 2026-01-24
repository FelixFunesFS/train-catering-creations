import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

export const MenuCTASection = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 200,
    variant: "elastic",
    mobile: { variant: "medium", delay: 100 },
    desktop: { variant: "elastic", delay: 200 },
  });

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-2xl overflow-hidden shadow-elevated">
        <div className="bg-gradient-to-r from-primary to-primary-dark py-10 lg:py-14">
          <div ref={ref} className={useAnimationClass(variant, isVisible)}>
            <div className="text-center space-y-6 max-w-3xl mx-auto px-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground">
                Ready to Plan Your Event?
              </h2>
              <p className="text-primary-foreground/90 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                Browse our menu and let us create a custom quote for your special
                occasion. We'll work with you to craft the perfect menu.
              </p>
              <p className="text-primary-foreground/80 text-sm">
                Proudly serving Charleston, SC and the surrounding Lowcountry
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                <Button asChild variant="cta-white" size="responsive-lg">
                  <Link to="/request-quote#page-header">Request a Free Quote</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="responsive-lg" 
                  className="border-white border-2 text-white bg-transparent hover:bg-white hover:text-primary"
                >
                  <a href="tel:8439700265">Call (843) 970-0265</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
