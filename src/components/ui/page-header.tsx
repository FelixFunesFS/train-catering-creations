import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  subtitle?: string;
  icons?: React.ReactNode[];
  buttons?: Array<{
    text: string;
    href: string;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "cta" | "cta-white";
    icon?: React.ReactNode;
  }>;
  className?: string;
  animated?: boolean;
}

export const PageHeader = ({ 
  title, 
  description, 
  badge,
  subtitle,
  icons = [], 
  buttons = [], 
  className,
  animated = true
}: PageHeaderProps) => {
  const { ref: badgeRef, isVisible: badgeVisible, variant: badgeVariant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  const { ref: titleRef, isVisible: titleVisible, variant: titleVariant } = useScrollAnimation({
    delay: 100,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 50 },
    desktop: { variant: "ios-spring", delay: 100 },
  });

  const { ref: descRef, isVisible: descVisible, variant: descVariant } = useScrollAnimation({
    delay: 200,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 100 },
    desktop: { variant: "ios-spring", delay: 200 },
  });

  const { ref: buttonsRef, isVisible: buttonsVisible, variant: buttonsVariant } = useScrollAnimation({
    delay: 300,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 150 },
    desktop: { variant: "scale-fade", delay: 300 },
  });

  return (
    <header 
      id="page-header" 
      className={cn(
        "text-center max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12 xl:py-16",
        className
      )}
    >
      {/* Badge + Icon (home page pattern) */}
      {badge && (
        <div 
          ref={animated ? badgeRef : undefined}
          className={cn(
            "flex items-center justify-center space-x-2 mb-3",
            animated && useAnimationClass(badgeVariant, badgeVisible)
          )}
        >
          {badge.icon && (
            <span className="text-ruby">{badge.icon}</span>
          )}
          <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
            {badge.text}
          </Badge>
        </div>
      )}

      {/* Legacy: Icon cluster (kept for backward compatibility) */}
      {!badge && icons.length > 0 && (
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

      {/* Title */}
      <div
        ref={animated ? titleRef : undefined}
        className={animated ? useAnimationClass(titleVariant, titleVisible) : undefined}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight title-hover-motion">
          {title}
        </h1>

        {/* Script subtitle (home page pattern) */}
        {subtitle && (
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium mb-3 sm:mb-4">
            {subtitle}
          </p>
        )}
      </div>

      {/* Description */}
      <p 
        ref={animated ? descRef : undefined}
        className={cn(
          "text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 lg:mb-8 xl:mb-10 subtitle-hover-motion",
          animated && useAnimationClass(descVariant, descVisible)
        )}
      >
        {description}
      </p>

      {/* Action buttons */}
      {buttons.length > 0 && (
        <div 
          ref={animated ? buttonsRef : undefined}
          className={cn(
            "flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6",
            animated && useAnimationClass(buttonsVariant, buttonsVisible)
          )}
        >
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
