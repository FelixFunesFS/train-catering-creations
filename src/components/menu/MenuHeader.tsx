import { UtensilsCrossed, ChefHat, Star } from "lucide-react";

const MenuHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-4">
        <UtensilsCrossed className="h-8 w-8 text-primary mr-2" />
        <ChefHat className="h-8 w-8 text-primary mx-2" />
        <Star className="h-8 w-8 text-primary ml-2" />
      </div>
      <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
        Our Menu
      </h1>
      <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Savor the flavors of the South with our signature dishes, crafted with love and over 20 years of culinary expertise.
      </p>
    </div>
  );
};

export default MenuHeader;