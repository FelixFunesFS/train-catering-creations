import { useState } from "react";
import { CompactMenuLayout } from "@/components/menu/CompactMenuLayout";
import { HorizontalCategoryNav } from "@/components/menu/HorizontalCategoryNav";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { cn } from "@/lib/utils";
import { menuData } from "@/data/menuData";

export const RegularMenuView = () => {
  const [activeCategory, setActiveCategory] = useState("appetizers");

  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({
    delay: 200,
    variant: "fade-up",
    mobile: { variant: "subtle", delay: 100 },
    desktop: { variant: "ios-spring", delay: 200 },
  });

  const getCurrentMenuData = () => {
    return menuData[activeCategory as keyof typeof menuData];
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const categories = [
    { id: "appetizers", label: "Appetizers", count: menuData.appetizers.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "entrees", label: "Entrees", count: menuData.entrees.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "sides", label: "Sides", count: menuData.sides.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "desserts", label: "Desserts", count: menuData.desserts.sections.reduce((acc, section) => acc + section.items.length, 0) },
  ];

  const currentData = getCurrentMenuData();

  return (
    <section className="py-6 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={contentRef} className={useAnimationClass(contentVariant, contentVisible)}>
          {/* Horizontal Category Navigation */}
          <HorizontalCategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            className="mb-6 lg:mb-8"
          />

          {/* Menu Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Hero Section */}
            <div className="relative h-32 sm:h-40 lg:h-48 xl:h-56 rounded-xl overflow-hidden mb-6 lg:mb-8">
              <img
                src={currentData.backgroundImage}
                alt={currentData.title}
                className="w-full h-full object-cover"
              />
              <div className={cn("absolute inset-0", currentData.overlayColor)} />
              <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                <div className="text-white space-y-2 lg:space-y-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-elegant font-bold">
                    {currentData.title}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg opacity-90 italic">
                    {currentData.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact Menu Sections */}
            <div className="space-y-4 lg:space-y-6">
              {currentData.sections.map((section, index) => (
                <CompactMenuLayout
                  key={`${section.title}-${index}`}
                  title={section.title}
                  subtitle={section.subtitle}
                  color={section.color}
                  items={section.items}
                  showFilters={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
