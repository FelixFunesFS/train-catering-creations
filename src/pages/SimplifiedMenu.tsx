import { useState } from "react";
import { menuData, weddingMenuItems, MenuItem, MenuSection } from "@/data/menuData";
import { SimpleMenuHeader } from "@/components/menu/SimpleMenuHeader";
import { CollapsibleCategory } from "@/components/menu/CollapsibleCategory";
import { MenuCTASection } from "@/components/menu/MenuCTASection";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import { cn } from "@/lib/utils";

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
  const [menuStyle, setMenuStyle] = useState<'regular' | 'wedding'>('regular');

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

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Mobile Quick Actions */}
      <QuickActionButton />

      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />

      {/* Page Header */}
      <SimpleMenuHeader />

      {/* Menu Style Toggle */}
      <div className="flex justify-center mb-6 px-4">
        <div className="inline-flex bg-muted rounded-full p-1 shadow-sm">
          <button
            onClick={() => setMenuStyle('regular')}
            className={cn(
              "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
              menuStyle === 'regular'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            Catering Menu
          </button>
          <button
            onClick={() => setMenuStyle('wedding')}
            className={cn(
              "px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
              menuStyle === 'wedding'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            Wedding Menu
          </button>
        </div>
      </div>

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

      {/* Menu Categories */}
      <section className="py-6 lg:py-12 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 lg:space-y-6">
            {categories.map((category, index) => (
              <CollapsibleCategory
                key={`${menuStyle}-${category.id}`}
                id={category.id}
                title={category.title}
                subtitle={category.subtitle}
                items={category.items}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <MenuCTASection />
    </div>
  );
};

export default SimplifiedMenu;
