
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  icons?: React.ReactNode[];
  buttons?: Array<{
    text: string;
    href: string;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "cta" | "cta-white";
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  icons = [], 
  buttons = [], 
  className 
}: PageHeaderProps) => {
  return (
    <header 
      id="page-header" 
      className={cn(
        "text-center max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12 xl:py-16",
        className
      )}
    >
      {/* Icon cluster */}
      {icons.length > 0 && (
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 lg:mb-8">
          {icons.map((icon, index) => (
            <div 
              key={index} 
              className="text-primary/80 hover:text-primary transition-colors duration-300 hover:scale-110"
            >
              {icon}
            </div>
          ))}
        </div>
      )}

      {/* Title with mobile-optimized sizing */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight title-hover-motion">
        {title}
      </h1>

      {/* Description with mobile-optimized sizing */}
      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 lg:mb-8 xl:mb-10 subtitle-hover-motion">
        {description}
      </p>

      {/* Action buttons with mobile optimization */}
      {buttons.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6">
          {buttons.map((button, index) => (
            <Button
              key={index}
              asChild
              variant={button.variant || "default"}
              size="responsive-md"
              className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] text-sm sm:text-base font-medium hover:scale-105 transition-transform duration-300"
            >
              <a href={button.href} className="flex items-center justify-center space-x-2">
                {button.icon && <span>{button.icon}</span>}
                <span>{button.text}</span>
              </a>
            </Button>
          ))}
        </div>
      )}
    </header>
  );
};
