import { useState } from "react";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuNavigation from "@/components/menu/MenuNavigation";
import ImageMenuCard from "@/components/menu/ImageMenuCard";
import MenuContact from "@/components/menu/MenuContact";
import { SectionCard } from "@/components/ui/section-card";
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
          color: "bg-accent/5 border-accent/15",
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
          color: "bg-primary/5 border-primary/15",
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
          color: "bg-secondary/5 border-secondary/15",
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
          color: "bg-accent/5 border-accent/15",
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
          color: "bg-primary/5 border-primary/15",
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
          color: "bg-secondary/5 border-secondary/15",
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
          color: "bg-green-500/5 border-green-500/15",
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
          color: "bg-amber-500/5 border-amber-500/15",
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
          color: "bg-emerald-500/5 border-emerald-500/15",
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
          color: "bg-pink-500/5 border-pink-500/15",
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
          color: "bg-purple-500/5 border-purple-500/15",
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
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
              <MenuHeader />
            </div>
          </div>
        </SectionCard>

        {/* Visual separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gradient-primary/20" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-gradient-hero text-muted-foreground">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </span>
          </div>
        </div>

        {/* Split-screen layout */}
        <SectionCard>
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
        </SectionCard>

        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
    </div>
  );
};

export default Menu;