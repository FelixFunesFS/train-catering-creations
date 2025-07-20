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
  const { ref: titleRef, isVisible: titleVisible, variant: titleVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const { ref: buttonsRef, isVisible: buttonsVisible, variant: buttonsVariant } = useScrollAnimation({ 
    variant: 'elastic', 
    delay: 200,
    mobile: { delay: 150 },
    desktop: { delay: 250 }
  });

  const titleAnimationClass = useAnimationClass(titleVariant, titleVisible);
  const buttonsAnimationClass = useAnimationClass(buttonsVariant, buttonsVisible);

  return (
    <section className="py-16 lg:py-20 bg-gradient-primary rounded-lg mx-4 sm:mx-6 lg:mx-8 my-2 sm:my-3 lg:my-4 shadow-elevated hover:shadow-glow-strong transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={titleRef} className={titleAnimationClass}>
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-elegant text-primary-foreground mb-4 sm:mb-6">
            {title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-primary-foreground mb-6 sm:mb-8 lg:mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
        <div ref={buttonsRef} className={`flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 max-w-sm sm:max-w-lg mx-auto px-4 sm:px-0 ${buttonsAnimationClass}`}>
          {buttons.map((button, index) => (
            <Button 
              key={index} 
              asChild 
              variant={button.variant || "cta"} 
              size="responsive-lg" 
              className="w-3/5 sm:w-auto sm:min-w-[14rem]"
            >
              <a href={button.href} className="flex items-center justify-center space-x-2">
                {button.icon}
                <span>{button.text}</span>
              </a>
            </Button>
          ))}
        </div>
        {footer && (
          <p className="text-primary-foreground mt-4 sm:mt-6 lg:mt-8 opacity-75 text-xs sm:text-sm">
            {footer}
          </p>
        )}
      </div>
    </section>
  );
};