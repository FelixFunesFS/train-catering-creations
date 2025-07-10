import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlantBasedCard = () => {
  const plantBasedItems = [
    { name: "Vegetarian Patties w/ Gravy", desc: "House-made patties served with rich, savory gravy" },
    { name: "Plant-Based Burger", desc: "Hearty veggie burger with all the fixings" },
    { name: "Vegetarian Hot Dogs", desc: "Plant-based dogs with your choice of toppings" },
    { name: "Vegetarian Lasagna", desc: "Layers of pasta with vegetables and cheese" },
    { name: "Vegetarian Spaghetti", desc: "Classic pasta with marinara or pesto sauce" },
    { name: "Vegetarian Meatloaf", desc: "Plant-based comfort food that satisfies" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-elegant text-foreground">Plant-Based Options</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Delicious alternatives for our vegetarian guests</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plantBasedItems.map((item, index) => (
            <div key={index} className="border-b border-muted/40 pb-3 last:border-b-0">
              <div>
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantBasedCard;