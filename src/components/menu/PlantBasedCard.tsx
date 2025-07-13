import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlantBasedCard = () => {
  const plantBasedItems = [
    { name: "Vegetarian Patties w/ Gravy", desc: "House-made patties with savory gravy" },
    { name: "Plant-Based Burger", desc: "Hearty veggie burger with fixings" },
    { name: "Vegetarian Hot Dogs", desc: "Plant-based with choice of toppings" },
    { name: "Vegetarian Lasagna", desc: "Layered pasta with vegetables & cheese" },
    { name: "Vegetarian Spaghetti", desc: "With marinara or pesto sauce" },
    { name: "Vegetarian Meatloaf", desc: "Plant-based comfort food" }
  ];

  return (
    <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01]">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Plant-Based Options</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Delicious alternatives for our vegetarian guests</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plantBasedItems.map((item, index) => (
            <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
              <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantBasedCard;