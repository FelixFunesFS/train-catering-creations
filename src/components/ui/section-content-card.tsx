
import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { cn } from "@/lib/utils";

interface SectionContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  interactive?: boolean;
}

export const SectionContentCard = React.forwardRef<HTMLDivElement, SectionContentCardProps>(({
  children,
  className,
  level = 2,
  interactive = false,
  ...props
}, ref) => {
  return (
    <NeumorphicCard
      ref={ref}
      level={level}
      interactive={interactive}
      className={cn(
        "p-6 transition-all duration-300",
        interactive && "hover:scale-105 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </NeumorphicCard>
  );
});

SectionContentCard.displayName = "SectionContentCard";
