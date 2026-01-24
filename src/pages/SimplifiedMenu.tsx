import { menuData, MenuItem, MenuSection } from "@/data/menuData";
import { SimpleMenuHeader } from "@/components/menu/SimpleMenuHeader";
import { CollapsibleCategory } from "@/components/menu/CollapsibleCategory";
import { MenuCTASection } from "@/components/menu/MenuCTASection";
import MenuContact from "@/components/menu/MenuContact";
import { QuickActionButton } from "@/components/menu/QuickActionButton";

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
  // Prepare categories with flattened items
  const categories = [
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
                key={category.id}
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

      {/* Contact Section */}
      <MenuContact />
    </div>
  );
};

export default SimplifiedMenu;
