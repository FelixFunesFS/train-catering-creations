
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MenuCategory {
  id: string;
  title: string;
  shortTitle: string;
  emoji: string;
}

const menuCategories: MenuCategory[] = [
  { id: "appetizers", title: "Appetizers", shortTitle: "Apps", emoji: "🥗" },
  { id: "entrees", title: "Main Entrees", shortTitle: "Entrees", emoji: "🍽️" },
  { id: "sides", title: "Perfect Sides", shortTitle: "Sides", emoji: "🥘" },
  { id: "desserts", title: "Tanya's Sweet Creations", shortTitle: "Desserts", emoji: "🧁" }
];

interface EnhancedMobileNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const EnhancedMobileNavigation = ({ 
  activeCategory, 
  onCategoryChange 
}: EnhancedMobileNavigationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 150;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle swipe gestures for category navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const currentIndex = menuCategories.findIndex(cat => cat.id === activeCategory);
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous category
        onCategoryChange(menuCategories[currentIndex - 1].id);
      } else if (deltaX < 0 && currentIndex < menuCategories.length - 1) {
        // Swipe left - go to next category
        onCategoryChange(menuCategories[currentIndex + 1].id);
      }
    }
  };

  return (
    <nav 
      ref={navRef}
      className={cn(
        "fixed top-16 left-0 right-0 z-40 transition-all duration-300 lg:hidden",
        "bg-background/95 backdrop-blur-md border-b border-border/20",
        "shadow-sm",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-center px-4 py-2">
        <div className="flex space-x-1 p-1 bg-muted/50 rounded-full max-w-full overflow-x-auto">
          {menuCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 touch-manipulation min-h-[44px] whitespace-nowrap",
                  "text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-95"
                )}
              >
                <span className="text-base">{category.emoji}</span>
                <span>{category.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Swipe indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="flex space-x-1 py-1">
          {menuCategories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-200",
                activeCategory === category.id
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};
