import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import EntreesCard from "@/components/menu/EntreesCard";
import PlantBasedCard from "@/components/menu/PlantBasedCard";
import SideDishesCard from "@/components/menu/SideDishesCard";
import DessertsCard from "@/components/menu/DessertsCard";
import MenuContact from "@/components/menu/MenuContact";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      {/* Hero Image Section */}
      <div className="relative h-64 lg:h-80 mb-16 overflow-hidden">
        <img 
          src="/lovable-uploads/de51be25-0eb8-43f8-a277-43227a8adb59.png" 
          alt="Beautifully presented casseroles and rice dishes" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-elegant font-bold mb-4">Our Menu</h1>
            <p className="text-xl lg:text-2xl max-w-2xl mx-auto">Crafted with passion, served with love</p>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default Menu;