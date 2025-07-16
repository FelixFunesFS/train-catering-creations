import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import EntreesCard from "@/components/menu/EntreesCard";
import SideDishesCard from "@/components/menu/SideDishesCard";
import DessertsCard from "@/components/menu/DessertsCard";
import MenuContact from "@/components/menu/MenuContact";
import { SectionCard } from "@/components/ui/section-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const Menu = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  // Menu card animations with staggered timing
  const { ref: appetizerRef, isVisible: appetizerVisible, variant: appetizerVariant } = useScrollAnimation({ 
    delay: 100, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 100 },
    desktop: { variant: 'ios-spring', delay: 100 }
  });
  
  const { ref: entreeRef, isVisible: entreeVisible, variant: entreeVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 150 },
    desktop: { variant: 'ios-spring', delay: 200 }
  });
  
  const { ref: sidesRef, isVisible: sidesVisible, variant: sidesVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 300 }
  });
  
  const { ref: dessertRef, isVisible: dessertVisible, variant: dessertVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 250 },
    desktop: { variant: 'ios-spring', delay: 400 }
  });
  
  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 500, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 300 },
    desktop: { variant: 'elastic', delay: 500 }
  });

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

        {/* Mobile: Enhanced layout */}
        <div className="lg:hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="space-y-12 py-8">
              <div ref={appetizerRef} className={useAnimationClass(appetizerVariant, appetizerVisible)}>
                <AppetizersCard />
              </div>
              
              {/* Section divider */}
              <div className="flex items-center justify-center">
                <div className="flex-1 border-t border-accent/20" />
                <div className="px-4">
                  <div className="w-3 h-3 bg-accent/30 rounded-full" />
                </div>
                <div className="flex-1 border-t border-accent/20" />
              </div>
              
              <div ref={entreeRef} className={useAnimationClass(entreeVariant, entreeVisible)}>
                <EntreesCard />
              </div>
              
              <div className="flex items-center justify-center">
                <div className="flex-1 border-t border-accent/20" />
                <div className="px-4">
                  <div className="w-3 h-3 bg-accent/30 rounded-full" />
                </div>
                <div className="flex-1 border-t border-accent/20" />
              </div>
              
              <div ref={sidesRef} className={useAnimationClass(sidesVariant, sidesVisible)}>
                <SideDishesCard />
              </div>
              
              <div className="flex items-center justify-center">
                <div className="flex-1 border-t border-accent/20" />
                <div className="px-4">
                  <div className="w-3 h-3 bg-primary/50 rounded-full" />
                </div>
                <div className="flex-1 border-t border-accent/20" />
              </div>
              
              <div ref={dessertRef} className={useAnimationClass(dessertVariant, dessertVisible)}>
                <DessertsCard />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Enhanced layout with better spacing */}
        <div className="hidden lg:block relative">
          <SectionCard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="space-y-16 py-8">
                <div ref={appetizerRef} className={useAnimationClass(appetizerVariant, appetizerVisible)}>
                  <AppetizersCard />
                </div>
                
                {/* Elegant section divider */}
                <div className="relative py-8">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gradient-primary/30" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-8 bg-gradient-hero">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full" />
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full" />
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                      </div>
                    </span>
                  </div>
                </div>
                
                <div ref={entreeRef} className={useAnimationClass(entreeVariant, entreeVisible)}>
                  <EntreesCard />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="space-y-16 py-8">
                <div ref={sidesRef} className={useAnimationClass(sidesVariant, sidesVisible)}>
                  <SideDishesCard />
                </div>
                
                {/* Special divider for desserts */}
                <div className="relative py-8">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-primary/40" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-8 bg-gradient-hero text-primary text-sm font-elegant">
                      Sweet Endings
                    </span>
                  </div>
                </div>
                
                <div ref={dessertRef} className={useAnimationClass(dessertVariant, dessertVisible)}>
                  <DessertsCard />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
          <MenuContact />
        </div>
    </div>
  );
};

export default Menu;