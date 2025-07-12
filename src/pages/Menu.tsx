import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import EntreesCard from "@/components/menu/EntreesCard";
import PlantBasedCard from "@/components/menu/PlantBasedCard";
import SideDishesCard from "@/components/menu/SideDishesCard";
import DessertsCard from "@/components/menu/DessertsCard";
import MenuContact from "@/components/menu/MenuContact";
import { SectionCard } from "@/components/ui/section-card";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MenuHeader />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <AppetizersCard />
              <EntreesCard />
              <PlantBasedCard />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <SideDishesCard />
              <DessertsCard />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MenuContact />
          </div>
        </SectionCard>
    </div>
  );
};
export default Menu;