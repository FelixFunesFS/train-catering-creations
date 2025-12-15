import React from "react";
import { cn } from "@/lib/utils";

interface MenuOrnamentProps {
  variant?: 'header' | 'section' | 'footer';
  className?: string;
}

export const MenuOrnament = ({ 
  variant = 'section',
  className 
}: MenuOrnamentProps) => {
  if (variant === 'header') {
    return (
      <div className={cn("flex items-center justify-center mb-4 md:mb-6", className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
          <span className="text-primary/60 text-sm">❧</span>
          <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>
    );
  }
  
  if (variant === 'footer') {
    return (
      <div className={cn("flex items-center justify-center mt-6 md:mt-8", className)}>
        <div className="flex items-center gap-2">
          <div className="w-6 md:w-10 h-px bg-border/40" />
          <span className="text-primary/40 text-xs">✧</span>
          <span className="text-primary/60 text-sm">✦</span>
          <span className="text-primary/40 text-xs">✧</span>
          <div className="w-6 md:w-10 h-px bg-border/40" />
        </div>
      </div>
    );
  }
  
  // Section (default)
  return (
    <div className={cn("flex items-center justify-center mb-6 md:mb-8", className)}>
      <div className="flex items-center gap-3">
        <div className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-primary/40" />
        <div className="flex items-center gap-1.5">
          <span className="text-primary/50 text-xs">✦</span>
          <span className="text-primary/70 text-base md:text-lg">❖</span>
          <span className="text-primary/50 text-xs">✦</span>
        </div>
        <div className="w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-primary/40" />
      </div>
    </div>
  );
};
