
import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { cn } from "@/lib/utils";

interface SectionContentCardProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  interactive?: boolean;
}

export const SectionContentCard: React.FC<SectionContentCardProps> = ({
  children,
  className,
  level = 2,
  interactive = false
}) => {
  return (
    <NeumorphicCard
      level={level}
      interactive={interactive}
      className={cn(
        "transition-all duration-300",
        interactive && "hover:scale-105 cursor-pointer",
        className
      )}
    >
      {children}
    </NeumorphicCard>
  );
};
