import { UtensilsCrossed, ChefHat, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const MenuHeader = () => {
  return (
    <PageHeader
      title="Crafted with Soul, Seasoned with Love"
      description="Explore a menu that honors tradition and excites the palate. From fall-off-the-bone ribs and creamy mac & cheese to delicate pastries and fresh seasonal sides, each dish is crafted with heart and heritage. Whether you're planning a casual gathering or formal affair, we offer customizable menu options to match your vision, your guests, and your flavor preferences."
      icons={[
        <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />,
        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Star className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
      buttons={[{ text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }]}
    />
  );
};

export default MenuHeader;