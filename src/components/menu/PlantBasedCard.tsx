import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlantBasedCard = () => {
  const plantBasedItems = [
    "Vegetarian Patties w/ Gravy",
    "Plant-Based Burger",
    "Vegetarian Hot Dogs",
    "Vegetarian Lasagna",
    "Vegetarian Spaghetti",
    "Vegetarian Meatloaf"
  ];

  return (
    <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01]">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Plant-Based Options</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantBasedItems.map((item, index) => (
            <div key={index} className="text-center py-3 px-2">
              <h4 className="text-sm font-medium text-foreground">{item}</h4>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantBasedCard;