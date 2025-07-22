import { useState } from "react";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuContact from "@/components/menu/MenuContact";
import { MobileMenuNavigation } from "@/components/menu/MobileMenuNavigation";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import { CollapsibleMenuSection } from "@/components/menu/CollapsibleMenuSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/ui/page-section";

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

  const menuData = {
    appetizers: {
      title: "Appetizers",
      subtitle: "Start your culinary journey",
      backgroundImage: "/lovable-uploads/02486e12-54f5-4b94-8d6e-f150546c6983.png",
      overlayColor: "bg-black/40",
      sections: [
        {
          title: "Platters & Boards",
          subtitle: "Perfect for sharing",
          color: "bg-category-appetizers/10 border-category-appetizers/30",
          items: [
            "Charcuterie Board",
            "Grazing Table", 
            "Fruit Platter",
            "Cheese Platter",
            "Meat Platter",
            "Vegetable Platter"
          ]
        },
        {
          title: "Signature Bites",
          subtitle: "Chef's special creations",
          color: "bg-category-appetizers/15 border-category-appetizers/40",
          items: [
            "Shrimp Deviled Eggs w/Bacon Finish",
            "Smoked Salmon Cucumber Bites",
            "Tomato Caprese",
            "Tomato Bruschetta",
            "Mini Chicken & Waffles",
            "Mini Loaded Potatoes",
            "Chocolate Covered Fruit Platter"
          ]
        },
        {
          title: "Classic Starters",
          subtitle: "Time-honored favorites",
          color: "bg-category-appetizers/8 border-category-appetizers/25",
          items: [
            "Chicken Sliders",
            "Pulled Pork Sliders",
            "Meatballs",
            "Deviled Eggs",
            "Chicken Salad",
            "Tuna Salad"
          ]
        }
      ]
    },
    entrees: {
      title: "Main Entrees",
      subtitle: "Hearty & satisfying selections",
      backgroundImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
      overlayColor: "bg-black/40",
      sections: [
        {
          title: "Poultry",
          subtitle: "Farm-fresh selections",
          color: "bg-category-entrees/10 border-category-entrees/30",
          items: [
            "Baked/Smoked Chicken",
            "Barbecue Chicken",
            "Chicken Tenders",
            "Turkey Wings",
            "Chicken Alfredo",
            "Fried Chicken",
            "Chicken Wings"
          ]
        },
        {
          title: "Beef & Pork",
          subtitle: "Premium cuts and classics",
          color: "bg-category-entrees/15 border-category-entrees/40",
          items: [
            "Smoked Sausage",
            "Fried Pork Chops",
            "Smothered Pork Chops",
            "Pulled Pork",
            "Ribs",
            "Meatloaf",
            "Brisket",
            "Hamburgers",
            "Spaghetti",
            "Lasagna",
            "Tacos"
          ]
        },
        {
          title: "Seafood",
          subtitle: "Fresh from the coast",
          color: "bg-category-entrees/8 border-category-entrees/25",
          items: [
            "Baked Salmon",
            "Shrimp Alfredo",
            "Low Country Boil",
            "Crabs",
            "Fried Fish"
          ]
        },
        {
          title: "Plant-Based Options",
          subtitle: "Wholesome vegetarian choices",
          color: "bg-category-sides/10 border-category-sides/30",
          items: [
            "Vegan Lasagna",
            "Quinoa Power Bowl",
            "Stuffed Bell Peppers",
            "Black Bean Burgers",
            "Roasted Vegetable Medley",
            "Grilled Portobello Mushrooms"
          ]
        }
      ]
    },
    sides: {
      title: "Perfect Sides",
      subtitle: "Complete your meal",
      backgroundImage: "/lovable-uploads/d6dabca7-8f7b-45c8-bb6c-ef86311e92bd.png",
      overlayColor: "bg-black/40",
      sections: [
        {
          title: "Comfort Classics",
          subtitle: "Southern favorites",
          color: "bg-category-sides/10 border-category-sides/30",
          items: [
            "Macaroni & Cheese",
            "Mashed Potatoes & Gravy",
            "White Rice",
            "Yellow Rice",
            "Dirty Rice",
            "Rice w/ Peas",
            "Rice w/ Gravy",
            "Yams",
            "Baked Beans",
            "Potato Salad"
          ]
        },
        {
          title: "Fresh & Light",
          subtitle: "Garden-fresh options",
          color: "bg-category-sides/15 border-category-sides/40",
          items: [
            "Garden Salad",
            "Caesar Salad",
            "Macaroni Salad",
            "Green Beans w/ Potatoes",
            "Sweet Peas w/ Corn",
            "Cabbage",
            "Vegetable Medley",
            "Corn"
          ]
        }
      ]
    },
    desserts: {
      title: "Tanya's Sweet Creations",
      subtitle: "Handcrafted with 20 years of expertise",
      backgroundImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=400&fit=crop",
      overlayColor: "bg-pink-900/40",
      sections: [
        {
          title: "Signature Cakes",
          subtitle: "Made with love and tradition",
          color: "bg-category-desserts/10 border-category-desserts/30",
          items: [
            "Red Velvet Cake",
            "Vanilla Cake",
            "Chocolate Cake",
            "Strawberry Cake",
            "Carrot Cake"
          ]
        },
        {
          title: "Specialty Treats",
          subtitle: "Sweet indulgences",
          color: "bg-category-desserts/15 border-category-desserts/40",
          items: [
            "Brownies",
            "Cheesecake",
            "Cupcakes",
            "Banana Pudding",
            "Dessert Shooters"
          ]
        }
      ]
    }
  };

  const getCurrentMenuData = () => {
    return menuData[activeCategory as keyof typeof menuData];
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Smooth scroll to top of menu content when category changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMenuContent = () => {
    const currentData = getCurrentMenuData();
    
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
        {/* Compact Hero Section with Mobile-First Heights */}
        <div className="relative h-28 sm:h-32 md:h-40 lg:h-48 xl:h-64 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <img 
            src={currentData.backgroundImage}
            alt={currentData.title}
            className="w-full h-full object-cover"
          />
          <div className={cn("absolute inset-0", currentData.overlayColor)} />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="text-white space-y-1 sm:space-y-2 md:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-elegant font-bold">
                {currentData.title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 italic">
                {currentData.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Dense Menu Sections */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
          {currentData.sections.map((section, index) => (
            <CollapsibleMenuSection
              key={`${section.title}-${index}`}
              title={section.title}
              subtitle={section.subtitle}
              color={section.color}
              items={section.items}
              defaultExpanded={index === 0}
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
      
      <section className="py-4 sm:py-6 md:py-8 lg:py-12">
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

      {/* Menu Content with Compact Spacing */}
      <section className="py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div 
            ref={contentRef} 
            className={useAnimationClass(contentVariant, contentVisible)}
          >
            {/* Navigation Tabs - Always Visible */}
            <div className="flex justify-center mb-4 lg:mb-8">
              <div className="flex space-x-1 sm:space-x-2 p-1.5 sm:p-2 bg-muted/50 rounded-lg overflow-x-auto">
                {Object.entries(menuData).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={cn(
                      "px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0",
                      activeCategory === key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    {data.title}
                  </button>
                ))}
              </div>
            </div>

            {renderMenuContent()}
          </div>
        </div>
      </section>

      {/* Custom Menu Planning Section - Full Width CTA */}
      <PageSection withBorder>
        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
      </PageSection>
    </div>
  );
};

export default Menu;
