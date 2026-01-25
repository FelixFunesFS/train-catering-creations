import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { menuData, weddingMenuItems, MenuItem, MenuSection } from "@/data/menuData";
import { SimpleMenuHeader } from "@/components/menu/SimpleMenuHeader";
import { CollapsibleCategory } from "@/components/menu/CollapsibleCategory";
import { MenuCTASection } from "@/components/menu/MenuCTASection";
import { MenuFoodGallery } from "@/components/menu/MenuFoodGallery";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { cn } from "@/lib/utils";
import { Utensils, Heart } from "lucide-react";

// Flatten nested sections into a single array of menu items
const flattenCategoryItems = (sections: MenuSection[]): MenuItem[] => {
  return sections.flatMap((section) =>
    section.items.map((item) => {
      if (typeof item === "string") {
        return {
          id: item.toLowerCase().replace(/\s+/g, "-"),
          name: item,
        };
      }
      return item;
    })
  );
};

const SimplifiedMenu = () => {
  const [searchParams] = useSearchParams();
  const initialStyle = searchParams.get('style') === 'wedding' ? 'wedding' : 'regular';
  const [menuStyle, setMenuStyle] = useState<'regular' | 'wedding'>(initialStyle);

  // Update menu style when URL param changes
  useEffect(() => {
    const styleParam = searchParams.get('style');
    if (styleParam === 'wedding') {
      setMenuStyle('wedding');
    }
  }, [searchParams]);

  // Get categories based on selected menu style
  const getCategories = () => {
    if (menuStyle === 'wedding') {
      return [
        {
          id: "appetizers",
          title: "Appetizers",
          subtitle: "Elegant starters for your special day",
          items: weddingMenuItems.appetizers,
        },
        {
          id: "entrees",
          title: "Entrées",
          subtitle: "Signature main courses",
          items: weddingMenuItems.entrees,
        },
        {
          id: "sides",
          title: "Sides",
          subtitle: "Perfect accompaniments",
          items: weddingMenuItems.sides,
        },
        {
          id: "desserts",
          title: "Desserts",
          subtitle: "Sweet finales",
          items: weddingMenuItems.desserts,
        },
      ];
    }

    return [
      {
        id: "appetizers",
        title: menuData.appetizers.title,
        subtitle: menuData.appetizers.subtitle,
        items: flattenCategoryItems(menuData.appetizers.sections),
      },
      {
        id: "entrees",
        title: menuData.entrees.title,
        subtitle: menuData.entrees.subtitle,
        items: flattenCategoryItems(menuData.entrees.sections),
      },
      {
        id: "sides",
        title: menuData.sides.title,
        subtitle: menuData.sides.subtitle,
        items: flattenCategoryItems(menuData.sides.sections),
      },
      {
        id: "desserts",
        title: menuData.desserts.title,
        subtitle: menuData.desserts.subtitle,
        items: flattenCategoryItems(menuData.desserts.sections),
      },
    ];
  };

  const categories = getCategories();

  const staggered = useStaggeredAnimation({
    itemCount: categories.length,
    staggerDelay: 150,
    baseDelay: 100,
    variant: 'fade-up'
  });

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Mobile Quick Actions */}
      <QuickActionButton />

      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Page Header */}
      <SimpleMenuHeader />

      {/* Menu Style Toggle */}
      <div className="flex justify-center mb-6 px-4">
        <div className="inline-flex bg-muted rounded-full p-1 shadow-sm">
          <button
            onClick={() => setMenuStyle('regular')}
            className={cn(
              "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center gap-2",
              menuStyle === 'regular'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            <Utensils className="h-4 w-4" />
            <span>Catering Menu</span>
          </button>
          <button
            onClick={() => setMenuStyle('wedding')}
            className={cn(
              "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center gap-2",
              menuStyle === 'wedding'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            <Heart className="h-4 w-4" />
            <span>Wedding Menu</span>
          </button>
        </div>
      </div>


      {/* Menu Categories */}
      <section className="py-6 lg:py-12 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={staggered.ref}
            className="space-y-4 lg:space-y-6"
          >
            {categories.map((category, index) => (
              <div 
                key={`${menuStyle}-${category.id}`}
                className={staggered.getItemClassName(index)}
                style={staggered.getItemStyle(index)}
              >
                <CollapsibleCategory
                  id={category.id}
                  title={category.title}
                  subtitle={category.subtitle}
                  items={category.items}
                  defaultExpanded={index === 0}
                  isWeddingMode={menuStyle === 'wedding'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food Gallery Section */}
      <MenuFoodGallery />

      {/* CTA Section */}
      <MenuCTASection />
    </div>
  );
};

export default SimplifiedMenu;
