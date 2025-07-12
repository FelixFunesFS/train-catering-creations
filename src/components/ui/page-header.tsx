import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icons?: ReactNode[];
  className?: string;
  children?: ReactNode;
}

export const PageHeader = ({ 
  title, 
  description, 
  icons = [], 
  className,
  children 
}: PageHeaderProps) => {
  return (
    <div className={cn("text-center mb-12 sm:mb-16", className)}>
      {/* Icons */}
      {icons.length > 0 && (
        <div className="flex justify-center mb-4 animate-fade-in">
          {icons.map((icon, index) => (
            <div 
              key={index} 
              className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 text-primary",
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
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 animate-fade-in">
        {title}
      </h1>
      
      {/* Decorative line */}
      <div className="w-16 sm:w-24 h-1 bg-gradient-primary mx-auto mb-6 sm:mb-8 animate-fade-in" />
      
      {/* Description */}
      {description && (
        <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in">
          {description}
        </p>
      )}
      
      {/* Custom content */}
      {children && (
        <div className="mt-6 sm:mt-8 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};