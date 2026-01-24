import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

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
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
              Our Catering Menu
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Authentic Southern cuisine crafted with love for weddings,
              corporate events, and special celebrations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
