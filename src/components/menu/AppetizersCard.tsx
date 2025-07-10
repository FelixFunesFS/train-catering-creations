import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AppetizersCard = () => {
  const appetizers = [
    { name: "Charcuterie Board", desc: "Artisanal meats, cheeses & accompaniments" },
    { name: "Chocolate Covered Fruit Platter", desc: "Fresh seasonal fruits in rich chocolate" },
    { name: "Shrimp Deviled Eggs w/Bacon Finish", desc: "Elevated with shrimp & crispy bacon" },
    { name: "Mini Chicken & Waffles", desc: "Southern comfort in bite-sized portions" },
    { name: "Smoked Salmon Cucumber Bites", desc: "Premium salmon on fresh cucumber" },
    { name: "Tomato Caprese", desc: "Fresh mozzarella, basil & vine-ripened tomatoes" },
    { name: "Mini Loaded Potatoes", desc: "Crispy skins with cheese, bacon & chives" },
    { name: "Grazing Table", desc: "Abundant spread perfect for sharing" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {appetizers.map((item, index) => (
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

export default AppetizersCard;