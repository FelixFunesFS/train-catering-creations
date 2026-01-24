import { useSearchParams } from "react-router-dom";
import { MenuStyleToggle, MenuStyle } from "@/components/menu/MenuStyleToggle";
import { UnifiedMenuHeader } from "@/components/menu/UnifiedMenuHeader";
import { RegularMenuView } from "@/components/menu/RegularMenuView";
import { WeddingMenuView } from "@/components/menu/WeddingMenuView";
import { MobileMenuNavigation } from "@/components/menu/MobileMenuNavigation";
import { QuickActionButton } from "@/components/menu/QuickActionButton";
import MenuContact from "@/components/menu/MenuContact";
import { PageSection } from "@/components/ui/page-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const UnifiedMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuStyle: MenuStyle = searchParams.get("style") === "wedding" ? "wedding" : "regular";

  const handleStyleChange = (style: MenuStyle) => {
    if (style === "wedding") {
      setSearchParams({ style: "wedding" });
    } else {
      setSearchParams({});
    }
    // Scroll to top on style change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({
    delay: 400,
    variant: "elastic",
    mobile: { variant: "medium", delay: 300 },
    desktop: { variant: "elastic", delay: 400 },
  });

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Mobile Navigation - only show for regular menu */}
      {menuStyle === "regular" && (
        <MobileMenuNavigation
          activeCategory="appetizers"
          onCategoryChange={() => {}}
        />
      )}
      <QuickActionButton />

      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-2xl pointer-events-none" />

      {/* Header Section */}
      <section className="py-8 lg:py-12">
        <UnifiedMenuHeader style={menuStyle} />
      </section>

      {/* Style Toggle */}
      <MenuStyleToggle
        activeStyle={menuStyle}
        onStyleChange={handleStyleChange}
        className="sticky top-0 z-40 bg-gradient-hero/95 backdrop-blur-sm border-b border-border/30"
      />

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

      {/* Menu Content - Transition between views */}
      <div
        key={menuStyle}
        className="animate-fade-in"
      >
        {menuStyle === "regular" ? <RegularMenuView /> : <WeddingMenuView />}
      </div>

      {/* Menu Planning Section */}
      <PageSection pattern="a" withBorder>
        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
      </PageSection>
    </div>
  );
};

export default UnifiedMenu;
