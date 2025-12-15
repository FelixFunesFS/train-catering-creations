import React from "react";
import { cn } from "@/lib/utils";

interface MenuDividerProps {
  variant?: 'simple' | 'ornamental' | 'dotted';
  className?: string;
}

export const MenuDivider = ({ 
  variant = 'ornamental',
  className 
}: MenuDividerProps) => {
  if (variant === 'simple') {
    return (
      <div className={cn("flex items-center justify-center py-8 md:py-12", className)}>
        <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    );
  }
  
  if (variant === 'dotted') {
    return (
      <div className={cn("flex items-center justify-center py-8 md:py-12", className)}>
        <div className="flex items-center gap-2">
          <div className="w-12 md:w-20 h-px bg-border/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <div className="w-12 md:w-20 h-px bg-border/50" />
        </div>
      </div>
    );
  }
  
  // Ornamental (default)
  return (
    <div className={cn("flex items-center justify-center py-10 md:py-16", className)}>
      <div className="flex items-center gap-4">
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-primary/40" />
        <div className="relative">
          <span className="text-primary/70 text-xl md:text-2xl">✦</span>
        </div>
        <div className="w-8 md:w-12 h-px bg-primary/40" />
        <div className="relative">
          <span className="text-primary/50 text-lg md:text-xl">❖</span>
        </div>
        <div className="w-8 md:w-12 h-px bg-primary/40" />
        <div className="relative">
          <span className="text-primary/70 text-xl md:text-2xl">✦</span>
        </div>
        <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-primary/40" />
      </div>
    </div>
  );
};
