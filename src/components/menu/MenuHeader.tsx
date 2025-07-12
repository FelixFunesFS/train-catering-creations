import { UtensilsCrossed, ChefHat, Star } from "lucide-react";

const MenuHeader = () => {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <div className="flex justify-center mb-4">
        <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2" />
        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-2" />
        <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary ml-2" />
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6">
        Our Menu
      </h1>
      <div className="w-16 sm:w-24 h-1 bg-gradient-primary mx-auto mb-6 sm:mb-8"></div>
      <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed px-4">
        Savor the flavors of the South with our signature dishes, crafted with love and over 20 years of culinary expertise.
      </p>
    </div>
  );
};

export default MenuHeader;