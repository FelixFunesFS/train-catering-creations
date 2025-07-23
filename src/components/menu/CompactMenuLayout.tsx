import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { CompactMenuItem } from "./CompactMenuItem";
import { FilterQuickTags } from "./FilterQuickTags";

interface CompactMenuItem {
  name: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

interface CompactMenuLayoutProps {
  title: string;
  subtitle: string;
  color: string;
  items: (string | CompactMenuItem)[];
  showFilters?: boolean;
  className?: string;
}

export const CompactMenuLayout = ({
  title,
  subtitle,
  color,
  items,
  showFilters = true,
  className
}: CompactMenuLayoutProps) => {
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  // Convert items to clean format (only popular flag)
  const cleanItems: CompactMenuItem[] = useMemo(() => {
    return items.map(item => {
      if (typeof item === 'string') {
        return {
          name: item,
          isPopular: Math.random() > 0.8
        };
      }
      return { name: item.name, isPopular: item.isPopular };
    });
  }, [items]);

  return (
    <section className={cn("space-y-4", className)}>
      <div className={cn("neumorphic-card-1 rounded-lg p-3 sm:p-4 lg:p-6 transition-all duration-300", color)}>
        <div ref={headerRef} className={`text-center mb-6 ${headerAnimationClass}`}>
          <p className="text-xs text-muted-foreground/80 uppercase tracking-wider mb-2">Crafted with Care</p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-elegant text-foreground mb-2 relative">
            {title}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-0.5 bg-primary/60 rounded-full" />
          </h3>
        </div>

        {/* Clean List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {cleanItems.map((item, index) => (
            <CompactMenuItem
              key={`${item.name}-${index}`}
              name={item.name}
              isPopular={item.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
};