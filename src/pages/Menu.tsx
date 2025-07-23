import { useState, Suspense } from "react";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuContact from "@/components/menu/MenuContact";
import { EnhancedMobileNavigation } from "@/components/menu/EnhancedMobileNavigation";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import { ResponsiveMenuSection } from "@/components/menu/ResponsiveMenuSection";
import { MenuSkeleton } from "@/components/menu/MenuSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/ui/page-section";

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const isMobile = useIsMobile();

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });

  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    delay: 100, 
    variant: 'fade-up',
    mobile: { variant: 'subtle', delay: 50 },
    desktop: { variant: 'ios-spring', delay: 100 }
  });
  
  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 150 },
    desktop: { variant: 'elastic', delay: 200 }
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
            {
              name: "Charcuterie Board",
              description: "Artisan meats, cheeses, and accompaniments",
              isPopular: true,
              isGlutenFree: true
            },
            {
              name: "Grazing Table",
              description: "Abundant selection for larger gatherings",
              isPopular: true
            },
            {
              name: "Fruit Platter",
              description: "Fresh seasonal fruits beautifully arranged",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Cheese Platter",
              description: "Curated selection of artisan cheeses",
              isVegetarian: true,
              isGlutenFree: true
            },
            "Meat Platter",
            {
              name: "Vegetable Platter",
              description: "Fresh vegetables with house-made dips",
              isVegetarian: true,
              isGlutenFree: true
            }
          ]
        },
        {
          title: "Signature Bites",
          subtitle: "Chef's special creations",
          color: "bg-category-appetizers/15 border-category-appetizers/40",
          items: [
            {
              name: "Shrimp Deviled Eggs w/Bacon Finish",
              description: "Elevated deviled eggs with premium shrimp",
              isPopular: true,
              isGlutenFree: true
            },
            {
              name: "Smoked Salmon Cucumber Bites",
              description: "Refreshing and elegant appetizer",
              isGlutenFree: true
            },
            {
              name: "Tomato Caprese",
              description: "Fresh mozzarella, tomatoes, and basil",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Tomato Bruschetta",
              description: "Classic Italian appetizer on toasted bread",
              isVegetarian: true
            },
            {
              name: "Mini Chicken & Waffles",
              description: "Southern comfort food in bite-sized portions",
              isPopular: true
            },
            "Mini Loaded Potatoes",
            {
              name: "Chocolate Covered Fruit Platter",
              description: "Decadent fruit with chocolate drizzle",
              isVegetarian: true
            }
          ]
        },
        {
          title: "Classic Starters",
          subtitle: "Time-honored favorites",
          color: "bg-category-appetizers/8 border-category-appetizers/25",
          items: [
            {
              name: "Chicken Sliders",
              description: "Mini sandwiches perfect for parties",
              isPopular: true
            },
            "Pulled Pork Sliders",
            "Meatballs",
            {
              name: "Deviled Eggs",
              description: "Southern classic with paprika",
              isVegetarian: true,
              isGlutenFree: true
            },
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
            {
              name: "Baked/Smoked Chicken",
              description: "Tender chicken with aromatic herbs",
              isPopular: true,
              isGlutenFree: true
            },
            {
              name: "Barbecue Chicken",
              description: "Smoky BBQ chicken with house sauce",
              isPopular: true
            },
            "Chicken Tenders",
            "Turkey Wings",
            "Chicken Alfredo",
            {
              name: "Fried Chicken",
              description: "Southern-style crispy fried chicken",
              isPopular: true
            },
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
            {
              name: "Pulled Pork",
              description: "Slow-smoked pork shoulder",
              isPopular: true,
              isGlutenFree: true
            },
            {
              name: "Ribs",
              description: "Fall-off-the-bone tender ribs",
              isPopular: true
            },
            "Meatloaf",
            {
              name: "Brisket",
              description: "Slow-smoked beef brisket",
              isPopular: true,
              isGlutenFree: true
            },
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
            {
              name: "Baked Salmon",
              description: "Fresh Atlantic salmon with herbs",
              isGlutenFree: true
            },
            "Shrimp Alfredo",
            {
              name: "Low Country Boil",
              description: "Coastal celebration of seafood",
              isPopular: true,
              isSpicy: true
            },
            "Crabs",
            "Fried Fish"
          ]
        },
        {
          title: "Plant-Based Options",
          subtitle: "Wholesome vegetarian choices",
          color: "bg-category-sides/10 border-category-sides/30",
          items: [
            {
              name: "Vegan Lasagna",
              description: "Plant-based comfort food",
              isVegetarian: true
            },
            {
              name: "Quinoa Power Bowl",
              description: "Nutritious and satisfying",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Stuffed Bell Peppers",
              description: "Colorful and flavorful",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Black Bean Burgers",
              description: "Hearty plant-based patties",
              isVegetarian: true
            },
            {
              name: "Roasted Vegetable Medley",
              description: "Seasonal vegetables roasted to perfection",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Grilled Portobello Mushrooms",
              description: "Meaty mushrooms with herb marinade",
              isVegetarian: true,
              isGlutenFree: true
            }
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
            {
              name: "Macaroni & Cheese",
              description: "Creamy, cheesy comfort food",
              isPopular: true,
              isVegetarian: true
            },
            {
              name: "Mashed Potatoes & Gravy",
              description: "Buttery potatoes with rich gravy",
              isVegetarian: true
            },
            {
              name: "White Rice",
              description: "Perfect fluffy rice",
              isVegetarian: true,
              isGlutenFree: true
            },
            "Yellow Rice",
            "Dirty Rice",
            "Rice w/ Peas",
            "Rice w/ Gravy",
            {
              name: "Yams",
              description: "Sweet and savory glazed yams",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Baked Beans",
              description: "Sweet and tangy baked beans",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Potato Salad",
              description: "Creamy Southern-style potato salad",
              isVegetarian: true,
              isGlutenFree: true
            }
          ]
        },
        {
          title: "Fresh & Light",
          subtitle: "Garden-fresh options",
          color: "bg-category-sides/15 border-category-sides/40",
          items: [
            {
              name: "Garden Salad",
              description: "Fresh mixed greens with vegetables",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Caesar Salad",
              description: "Classic Caesar with parmesan",
              isVegetarian: true
            },
            {
              name: "Macaroni Salad",
              description: "Creamy pasta salad",
              isVegetarian: true
            },
            {
              name: "Green Beans w/ Potatoes",
              description: "Southern-style green beans",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Sweet Peas w/ Corn",
              description: "Colorful vegetable medley",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Cabbage",
              description: "Seasoned and sautéed cabbage",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Vegetable Medley",
              description: "Seasonal mixed vegetables",
              isVegetarian: true,
              isGlutenFree: true
            },
            {
              name: "Corn",
              description: "Sweet corn kernels",
              isVegetarian: true,
              isGlutenFree: true
            }
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
            {
              name: "Red Velvet Cake",
              description: "Classic Southern red velvet with cream cheese frosting",
              isPopular: true,
              isVegetarian: true
            },
            {
              name: "Vanilla Cake",
              description: "Light and fluffy vanilla cake",
              isVegetarian: true
            },
            {
              name: "Chocolate Cake",
              description: "Rich and decadent chocolate cake",
              isPopular: true,
              isVegetarian: true
            },
            {
              name: "Strawberry Cake",
              description: "Fresh strawberry cake with berry frosting",
              isVegetarian: true
            },
            {
              name: "Carrot Cake",
              description: "Moist carrot cake with cream cheese frosting",
              isVegetarian: true
            }
          ]
        },
        {
          title: "Specialty Treats",
          subtitle: "Sweet indulgences",
          color: "bg-category-desserts/15 border-category-desserts/40",
          items: [
            {
              name: "Brownies",
              description: "Fudgy chocolate brownies",
              isVegetarian: true
            },
            {
              name: "Cheesecake",
              description: "Creamy New York style cheesecake",
              isVegetarian: true
            },
            {
              name: "Cupcakes",
              description: "Individual cakes in various flavors",
              isVegetarian: true
            },
            {
              name: "Banana Pudding",
              description: "Traditional banana pudding with wafers",
              isPopular: true,
              isVegetarian: true
            },
            {
              name: "Dessert Shooters",
              description: "Mini desserts in shot glasses",
              isVegetarian: true
            }
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
    // Smooth scroll to top with mobile-friendly offset
    const offset = isMobile ? 100 : 0;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  };

  const renderMenuContent = () => {
    const currentData = getCurrentMenuData();
    
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Mobile-optimized Hero Section */}
        <div className={cn(
          "relative rounded-xl overflow-hidden mb-4 sm:mb-6 lg:mb-8",
          isMobile ? "h-24" : "h-32 sm:h-40 lg:h-48 xl:h-56"
        )}>
          <img 
            src={currentData.backgroundImage}
            alt={currentData.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className={cn("absolute inset-0", currentData.overlayColor)} />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="text-white space-y-1 sm:space-y-2 lg:space-y-4">
              <h2 className={cn(
                "font-elegant font-bold",
                isMobile ? "text-lg" : "text-xl sm:text-2xl lg:text-3xl xl:text-4xl"
              )}>
                {currentData.title}
              </h2>
              <p className={cn(
                "opacity-90 italic",
                isMobile ? "text-xs" : "text-sm sm:text-base lg:text-lg"
              )}>
                {currentData.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Menu Sections */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {currentData.sections.map((section, index) => (
            <Suspense 
              key={`${section.title}-${index}`}
              fallback={<MenuSkeleton itemCount={6} isMobile={isMobile} />}
            >
              <ResponsiveMenuSection
                title={section.title}
                subtitle={section.subtitle}
                color={section.color}
                items={section.items}
                defaultExpanded={index === 0}
                showFilters={true}
              />
            </Suspense>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <EnhancedMobileNavigation 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <QuickActionButton />
      
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />
      
      <section className={cn("py-4 sm:py-6 lg:py-12", isMobile && "pt-2")}>
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
      <section className={cn("py-4 sm:py-6 lg:py-12", isMobile && "pt-2")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div 
            ref={contentRef} 
            className={useAnimationClass(contentVariant, contentVisible)}
          >
            {/* Mobile-optimized Navigation Tabs */}
            <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
              <div className={cn(
                "flex p-1 sm:p-2 bg-muted/50 rounded-lg",
                isMobile ? "space-x-1 overflow-x-auto max-w-full" : "space-x-1 sm:space-x-2"
              )}>
                {Object.entries(menuData).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={cn(
                      "px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 touch-manipulation",
                      isMobile ? "min-h-[44px]" : "",
                      activeCategory === key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-95"
                    )}
                  >
                    {isMobile ? data.title.split(' ')[0] : data.title}
                  </button>
                ))}
              </div>
            </div>

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
