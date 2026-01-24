import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/ui/page-section";
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
    <PageSection pattern="a" withBorder>
      <div ref={ref} className={useAnimationClass(variant, isVisible)}>
        <div className="text-center space-y-6 py-4 lg:py-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground">
            Ready to Plan Your Event?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Browse our menu and let us create a custom quote for your special
            occasion. We'll work with you to craft the perfect menu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Button asChild variant="cta" size="responsive-lg">
              <Link to="/request-quote#page-header">Request a Free Quote</Link>
            </Button>
            <Button asChild variant="outline" size="responsive-lg">
              <a href="tel:8439700265">Call (843) 970-0265</a>
            </Button>
          </div>
        </div>
      </div>
    </PageSection>
  );
};
