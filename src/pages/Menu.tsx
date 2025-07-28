import { useState } from "react";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuContact from "@/components/menu/MenuContact";
import { MobileMenuNavigation } from "@/components/menu/MobileMenuNavigation";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import { CompactMenuLayout } from "@/components/menu/CompactMenuLayout";
import { HorizontalCategoryNav } from "@/components/menu/HorizontalCategoryNav";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/ui/page-section";
import { menuData } from "@/data/menuData";

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("appetizers");

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });

  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'fade-up',
    mobile: { variant: 'subtle', delay: 100 },
    desktop: { variant: 'ios-spring', delay: 200 }
  });
  
  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 300 },
    desktop: { variant: 'elastic', delay: 400 }
  });

  // Using shared menu data

  const getCurrentMenuData = () => {
    return menuData[activeCategory as keyof typeof menuData];
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: "appetizers", label: "Appetizers", count: menuData.appetizers.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "entrees", label: "Entrees", count: menuData.entrees.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "sides", label: "Sides", count: menuData.sides.sections.reduce((acc, section) => acc + section.items.length, 0) },
    { id: "desserts", label: "Desserts", count: menuData.desserts.sections.reduce((acc, section) => acc + section.items.length, 0) }
  ];

  const renderMenuContent = () => {
    const currentData = getCurrentMenuData();
    
    return (
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <MobileMenuNavigation 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <QuickActionButton />
      
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />
      
      <section className="py-6 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <MenuHeader />
          </div>
        </div>
      </section>

      {/* Visual separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-muted/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 bg-gradient-hero text-muted-foreground">
            <div className="w-8 h-8 bg-primary/8 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </span>
        </div>
      </div>

      {/* Enhanced Menu Content */}
      <section className="py-6 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div 
            ref={contentRef} 
            className={useAnimationClass(contentVariant, contentVisible)}
          >
            {/* Horizontal Category Navigation */}
            <HorizontalCategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              className="mb-6 lg:mb-8"
            />

            {renderMenuContent()}
          </div>
        </div>
      </section>

      {/* Menu Planning Section */}
      <PageSection withBorder>
        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
      </PageSection>
    </div>
  );
};

export default Menu;
