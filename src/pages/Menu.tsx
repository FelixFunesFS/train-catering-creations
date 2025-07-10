import MenuHeader from "@/components/menu/MenuHeader";
import AppetizersCard from "@/components/menu/AppetizersCard";
import MainCoursesCard from "@/components/menu/MainCoursesCard";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 max-w-8xl mx-auto">
          <AppetizersCard />
          <MainCoursesCard />
          <SideDishesCard />
          <PlantBasedCard />
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