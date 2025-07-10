import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import PoultrySeafoodCard from "@/components/menu/PoultrySeafoodCard";
import BeefPorkCard from "@/components/menu/BeefPorkCard";
import SideDishesCard from "@/components/menu/SideDishesCard";
import PlantBasedCard from "@/components/menu/PlantBasedCard";
import DessertsCard from "@/components/menu/DessertsCard";
import MenuContact from "@/components/menu/MenuContact";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MenuHeader />

        {/* Card Grid Menu */}
        <div className="space-y-16">
          {/* First Row - Appetizers & Poultry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AppetizersCard />
            <PoultrySeafoodCard />
          </div>
          
          {/* Second Row - Beef & Plant-Based */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BeefPorkCard />
            <PlantBasedCard />
          </div>
          
          {/* Third Row - Side Dishes Centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SideDishesCard />
            </div>
          </div>
          
          {/* Full Width Desserts Showcase */}
          <div className="max-w-6xl mx-auto">
            <DessertsCard />
          </div>
        </div>

        {/* Contact for Custom Menu */}
        <div className="mt-12">
          <MenuContact />
        </div>
      </div>
    </div>
  );
};

export default Menu;