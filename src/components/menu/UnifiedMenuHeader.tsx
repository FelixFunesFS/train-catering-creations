import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MenuStyle } from "./MenuStyleToggle";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface UnifiedMenuHeaderProps {
  style: MenuStyle;
}

export const UnifiedMenuHeader = ({ style }: UnifiedMenuHeaderProps) => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  const content = {
    regular: {
      title: "Crafted with Soul, Seasoned with Love",
      description:
        "Explore our full catering menu featuring authentic Southern dishes, smoked meats, and classic comfort food favorites.",
      cta: "Request Quote",
      ctaLink: "/request-quote/regular#page-header",
    },
    wedding: {
      title: "Elegant Wedding Catering with Southern Soul",
      description:
        "Create unforgettable moments with our refined wedding menu, thoughtfully designed for your special celebration.",
      cta: "Plan Your Wedding",
      ctaLink: "/request-quote/wedding#page-header",
    },
  };

  const { title, description, cta, ctaLink } = content[style];

  return (
    <div
      ref={ref}
      className={useAnimationClass(variant, isVisible)}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          {description}
        </p>
        <Link to={ctaLink}>
          <Button variant="cta" size="lg" className="shadow-lg">
            {cta}
          </Button>
        </Link>
      </div>
    </div>
  );
};
