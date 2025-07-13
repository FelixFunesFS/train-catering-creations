import { UtensilsCrossed, ChefHat, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const MenuHeader = () => {
  return (
    <PageHeader
      title="Our Menu"
      description="Savor the flavors of the South with our signature dishes, crafted with love and over 20 years of culinary expertise."
      icons={[
        <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />,
        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Star className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
      buttons={[{ text: "Request Quote", href: "/request-quote", variant: "cta" }]}
    />
  );
};

export default MenuHeader;