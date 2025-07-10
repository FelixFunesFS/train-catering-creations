import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AppetizersCard = () => {
  const appetizers = [
    { name: "Charcuterie Board", desc: "Selection of artisanal meats, cheeses, and accompaniments" },
    { name: "Chocolate Covered Fruit Platter", desc: "Fresh seasonal fruits dipped in rich chocolate" },
    { name: "Shrimp Deviled Eggs w/Bacon Finish", desc: "Classic deviled eggs elevated with fresh shrimp and crispy bacon" },
    { name: "Mini Chicken & Waffles", desc: "Southern comfort in bite-sized portions" },
    { name: "Smoked Salmon Cucumber Bites", desc: "Fresh cucumber rounds topped with premium smoked salmon" },
    { name: "Tomato Caprese", desc: "Fresh mozzarella, basil, and vine-ripened tomatoes" },
    { name: "Mini Loaded Potatoes", desc: "Crispy potato skins loaded with cheese, bacon, and chives" },
    { name: "Grazing Table", desc: "An abundant spread perfect for sharing" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="h-full">
        <div className="space-y-4">
          {appetizers.map((item, index) => (
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

export default AppetizersCard;