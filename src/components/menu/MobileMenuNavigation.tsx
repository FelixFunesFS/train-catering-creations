
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MenuCategory {
  id: string;
  title: string;
  shortTitle: string;
}

const menuCategories: MenuCategory[] = [
  { id: "appetizers", title: "Appetizers", shortTitle: "Apps" },
  { id: "entrees", title: "Main Entrees", shortTitle: "Entrees" },
  { id: "sides", title: "Perfect Sides", shortTitle: "Sides" },
  { id: "desserts", title: "Tanya's Sweet Creations", shortTitle: "Desserts" }
];

interface MobileMenuNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const MobileMenuNavigation = ({ activeCategory, onCategoryChange }: MobileMenuNavigationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-16 sm:top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 lg:hidden",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="flex justify-center py-2">
        <div className="flex space-x-1 p-1.5 bg-muted/50 rounded-full mx-3">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 min-h-[40px] min-w-[60px] sm:min-w-[70px]",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {category.shortTitle}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
