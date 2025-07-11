import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import EntreesCard from "@/components/menu/EntreesCard";
import PlantBasedCard from "@/components/menu/PlantBasedCard";
import SideDishesCard from "@/components/menu/SideDishesCard";
import DessertsCard from "@/components/menu/DessertsCard";
import MenuContact from "@/components/menu/MenuContact";
const Menu = () => {
  return <div className="min-h-screen bg-gradient-hero py-16">
      {/* Hero Image Section */}
      
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MenuHeader />

        {/* Full Width Menu Cards */}
        <div className="space-y-8">
          {/* Appetizers - Full Width */}
          <AppetizersCard />
          
          {/* Main Entrees - Full Width */}
          <EntreesCard />
          
          {/* Plant-Based Options - Full Width */}
          <PlantBasedCard />
          
          {/* Side Dishes - Full Width */}
          <SideDishesCard />
          
          {/* Desserts - Full Width */}
          <DessertsCard />
        </div>

        {/* Contact for Custom Menu */}
        <div className="mt-12">
          <MenuContact />
        </div>
      </div>
    </div>;
};
export default Menu;