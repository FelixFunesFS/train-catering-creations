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
        <div className="space-y-12">
          {/* First Row - Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppetizersCard />
            <PoultrySeafoodCard />
            <PlantBasedCard />
          </div>
          
          {/* Second Row - Remaining Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <BeefPorkCard />
            <SideDishesCard />
          </div>
          
          {/* Full Width Desserts */}
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