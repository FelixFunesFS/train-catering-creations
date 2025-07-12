import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <section className="py-6 md:py-8 lg:py-10 bg-gradient-primary rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4 md:my-6 shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-6">
          {title}
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-primary-foreground mb-8 lg:mb-12 opacity-90">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-xs sm:max-w-lg mx-auto">
          {buttons.map((button, index) => (
            <Button 
              key={index} 
              asChild 
              variant={button.variant || "cta"} 
              size="responsive-sm" 
              className="w-full sm:w-auto"
            >
              <a href={button.href} className="flex items-center justify-center space-x-2">
                {button.icon}
                <span>{button.text}</span>
              </a>
            </Button>
          ))}
        </div>
        {footer && (
          <p className="text-primary-foreground mt-6 lg:mt-8 opacity-75 text-sm sm:text-base">
            {footer}
          </p>
        )}
      </div>
    </section>
  );
};