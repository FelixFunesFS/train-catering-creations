
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
        "text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16",
        className
      )}
    >
      {/* Icon cluster */}
      {icons.length > 0 && (
        <div className="flex justify-center items-center space-x-4 mb-6 sm:mb-8">
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

      {/* Title with hover motion */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight title-hover-motion">
        {title}
      </h1>

      {/* Description with subtle hover motion */}
      <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 lg:mb-10 subtitle-hover-motion">
        {description}
      </p>

      {/* Action buttons */}
      {buttons.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          {buttons.map((button, index) => (
            <Button
              key={index}
              asChild
              variant={button.variant || "default"}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] text-base font-medium hover:scale-105 transition-transform duration-300"
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
