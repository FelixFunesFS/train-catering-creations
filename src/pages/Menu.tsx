import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import EntreesCard from "@/components/menu/EntreesCard";
import PlantBasedCard from "@/components/menu/PlantBasedCard";
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
  
  const { ref: plantRef, isVisible: plantVisible, variant: plantVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 300 }
  });
  
  const { ref: sidesRef, isVisible: sidesVisible, variant: sidesVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 250 },
    desktop: { variant: 'ios-spring', delay: 400 }
  });
  
  const { ref: dessertRef, isVisible: dessertVisible, variant: dessertVariant } = useScrollAnimation({ 
    delay: 500, 
    variant: 'ios-spring',
    mobile: { variant: 'subtle', delay: 300 },
    desktop: { variant: 'ios-spring', delay: 500 }
  });
  
  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 600, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 350 },
    desktop: { variant: 'elastic', delay: 600 }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
              <MenuHeader />
            </div>
          </div>
        </SectionCard>

        {/* Mobile: Direct cards without SectionCard wrapper */}
        <div className="lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="space-y-8">
              <div ref={appetizerRef} className={useAnimationClass(appetizerVariant, appetizerVisible)}>
                <AppetizersCard />
              </div>
              <div ref={entreeRef} className={useAnimationClass(entreeVariant, entreeVisible)}>
                <EntreesCard />
              </div>
              <div ref={plantRef} className={useAnimationClass(plantVariant, plantVisible)}>
                <PlantBasedCard />
              </div>
              <div ref={sidesRef} className={useAnimationClass(sidesVariant, sidesVisible)}>
                <SideDishesCard />
              </div>
              <div ref={dessertRef} className={useAnimationClass(dessertVariant, dessertVisible)}>
                <DessertsCard />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: With SectionCard wrapper */}
        <div className="hidden lg:block">
          <SectionCard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                <div ref={appetizerRef} className={useAnimationClass(appetizerVariant, appetizerVisible)}>
                  <AppetizersCard />
                </div>
                <div ref={entreeRef} className={useAnimationClass(entreeVariant, entreeVisible)}>
                  <EntreesCard />
                </div>
                <div ref={plantRef} className={useAnimationClass(plantVariant, plantVisible)}>
                  <PlantBasedCard />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                <div ref={sidesRef} className={useAnimationClass(sidesVariant, sidesVisible)}>
                  <SideDishesCard />
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