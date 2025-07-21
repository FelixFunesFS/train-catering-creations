
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MenuNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  {
    id: "appetizers",
    title: "Appetizers",
    subtitle: "Start your journey",
    icon: "🥗",
  },
  {
    id: "entrees",
    title: "Main Entrees",
    subtitle: "Hearty selections",
    icon: "🍽️",
  },
  {
    id: "sides",
    title: "Perfect Sides",
    subtitle: "Complete your meal",
    icon: "🥘",
  },
  {
    id: "desserts",
    title: "Sweet Creations",
    subtitle: "Tanya's specialties",
    icon: "🧁",
  },
];

const MenuNavigation = ({ activeCategory, onCategoryChange }: MenuNavigationProps) => {
  return (
    <div className="space-y-3">
      <div className="mb-8">
        <h2 className="text-2xl font-elegant text-foreground mb-2 title-hover-motion">Menu Categories</h2>
        <div className="w-16 h-0.5 bg-gradient-primary rounded-full"></div>
      </div>
      
      {categories.map((category) => (
        <Card
          key={category.id}
          className={cn(
            "p-4 cursor-pointer transition-all duration-300 border-2 hover:scale-[1.02]",
            activeCategory === category.id
              ? "bg-primary/10 border-primary/40 shadow-elegant"
              : "bg-background/50 border-muted/30 hover:border-primary/20 hover:bg-primary/5"
          )}
          onClick={() => onCategoryChange(category.id)}
        >
          <div className="flex items-center space-x-4">
            <div className="text-2xl transition-transform duration-300 hover:scale-110">{category.icon}</div>
            <div className="flex-1">
              <h3 className={cn(
                "text-lg font-semibold transition-all duration-300 card-title-hover-motion",
                activeCategory === category.id ? "text-primary" : "text-foreground"
              )}>
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground subtitle-hover-motion">{category.subtitle}</p>
            </div>
            <div className={cn(
              "w-2 h-8 rounded-full transition-all duration-300",
              activeCategory === category.id ? "bg-primary" : "bg-transparent"
            )} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MenuNavigation;
