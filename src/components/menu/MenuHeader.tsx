import { UtensilsCrossed } from "lucide-react";

const MenuHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <UtensilsCrossed className="w-8 h-8 text-primary" />
        </div>
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