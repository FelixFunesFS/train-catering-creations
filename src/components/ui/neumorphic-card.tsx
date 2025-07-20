
import * as React from "react";
import { cn } from "@/lib/utils";

export type NeumorphicCardLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: NeumorphicCardLevel;
  interactive?: boolean;
  pressed?: boolean;
}

const NeumorphicCard = React.forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, level = 2, interactive = false, pressed = false, ...props }, ref) => {
    const baseClasses = `neumorphic-card-${level}`;
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          "rounded-lg p-6 focus-visible-enhanced",
          interactive && "cursor-pointer",
          pressed && "transform translate-y-px",
          className
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    );
  }
);

NeumorphicCard.displayName = "NeumorphicCard";

export { NeumorphicCard };
