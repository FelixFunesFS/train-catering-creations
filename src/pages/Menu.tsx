import { useState } from "react";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuNavigation from "@/components/menu/MenuNavigation";
import ImageMenuCard from "@/components/menu/ImageMenuCard";
import MenuContact from "@/components/menu/MenuContact";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

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
      backgroundImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
      overlayColor: "bg-black/40",
      sections: [
        {
          title: "Platters & Boards",
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
      backgroundImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=400&fit=crop",
      overlayColor: "bg-black/40",
      sections: [
        {
          title: "Comfort Classics",
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

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Enhanced decorative background elements with subtle color */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />
        
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
              <MenuHeader />
            </div>
          </div>
        </section>

        {/* Visual separator with subtle enhancement */}
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

        {/* Split-screen layout */}
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div 
              ref={contentRef} 
              className={useAnimationClass(contentVariant, contentVisible)}
            >
              <div className="grid lg:grid-cols-4 gap-8 py-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <MenuNavigation 
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                  <div className="transition-all duration-500 ease-in-out">
                    <ImageMenuCard
                      title={getCurrentMenuData().title}
                      subtitle={getCurrentMenuData().subtitle}
                      items={[]}
                      sections={getCurrentMenuData().sections}
                      backgroundImage={getCurrentMenuData().backgroundImage}
                      overlayColor={getCurrentMenuData().overlayColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
    </div>
  );
};

export default Menu;
