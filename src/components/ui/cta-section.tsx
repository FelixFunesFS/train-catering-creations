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
}

export const CTASection = ({ title, description, buttons, footer }: CTASectionProps) => {
  const { ref: contentRef, isVisible, variant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });

  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      {/* Card Container with consistent margins */}
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
        {/* Card Background */}
        <div className="bg-gradient-to-r from-primary to-primary-dark py-8 sm:py-10 lg:py-12">
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
