import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  icons?: ReactNode[];
  className?: string;
  children?: ReactNode;
  buttons?: Array<{
    text: string;
    href: string;
    variant?: string;
  }>;
}

export const PageHeader = ({ 
  title, 
  description, 
  icons = [], 
  className,
  children,
  buttons = []
}: PageHeaderProps) => {
  return (
    <div id="page-header" className={cn("text-center mb-8 sm:mb-12 md:mb-16", className)}>
      {/* Icons */}
      {icons.length > 0 && (
        <div className="flex justify-center mb-4 animate-fade-in">
          {icons.map((icon, index) => (
            <div 
              key={index} 
              className={cn(
                "h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary",
                index === 0 && "mr-2",
                index === icons.length - 1 && "ml-2",
                index > 0 && index < icons.length - 1 && "mx-2"
              )}
            >
              {icon}
            </div>
          ))}
        </div>
      )}
      
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 animate-fade-in">
        {title}
      </h1>
      
      {/* Decorative line */}
      <div className="w-12 sm:w-16 md:w-24 h-1 bg-gradient-primary mx-auto mb-6 sm:mb-8 animate-fade-in" />
      
      {/* Description */}
      {description && (
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-foreground max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in">
          {description}
        </p>
      )}
      
      {/* Custom content */}
      {children && (
        <div className="mt-6 sm:mt-8 animate-fade-in">
          {children}
        </div>
      )}
      
      {/* Buttons */}
      {buttons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6 sm:mt-8 animate-fade-in">
          {buttons.map((button, index) => (
                <Button 
                  key={index} 
                  asChild 
                  variant={button.variant as any || "cta"} 
                  size="responsive-md" 
                  className="w-3/5 sm:w-auto sm:min-w-[14rem]"
                >
              <Link to={button.href}>
                {button.text}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};