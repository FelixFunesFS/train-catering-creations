import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface CTAButton {
  text: string;
  href: string;
  variant?: "cta" | "cta-white";
  icon?: ReactNode;
}

interface CTASectionProps {
  title: string;
  description: string;
  buttons: CTAButton[];
  footer?: string;
  showWatermark?: boolean;
}

export const CTASection = ({ title, description, buttons, footer, showWatermark = false }: CTASectionProps) => {
  const { ref: contentRef, isVisible, variant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });

  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <section className="pt-10 pb-6 sm:pt-12 sm:pb-8 lg:py-16">
      {/* Card Container with consistent margins */}
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
        {/* Card Background */}
        <div className="relative bg-gradient-to-r from-primary to-primary-dark py-8 sm:py-10 lg:py-12 overflow-hidden">
          {/* Watermark Logo - only shown when prop is true */}
          {showWatermark && (
            <div className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="" 
                aria-hidden="true"
                className="w-28 sm:w-36 lg:w-44 h-28 sm:h-36 lg:h-44 object-contain opacity-[0.08]"
              />
            </div>
          )}
          <div 
            ref={contentRef} 
            className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${animationClass}`}
          >
            {/* Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-elegant text-primary-foreground mb-3 sm:mb-4 lg:mb-6">
              {title}
            </h2>
            
            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              {buttons.map((button, index) => (
                <Button 
                  key={index} 
                  asChild 
                  variant={button.variant || "cta"} 
                  size="responsive-lg" 
                  className="w-full sm:w-auto sm:min-w-[12rem]"
                >
                  <a href={button.href} className="flex items-center justify-center gap-2">
                    {button.icon}
                    <span>{button.text}</span>
                  </a>
                </Button>
              ))}
            </div>
            
            {/* Footer */}
            {footer && (
              <p className="text-primary-foreground/75 mt-4 sm:mt-6 text-xs sm:text-sm">
                {footer}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
