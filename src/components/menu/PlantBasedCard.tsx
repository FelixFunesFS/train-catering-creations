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
    <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border border-green-500/20 hover:border-green-500/40 relative overflow-hidden group">
      {/* Nature-inspired decorative elements */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-green-400/10 to-transparent rounded-tl-full" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3 mx-auto">
          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500/40 rounded-full" />
          </div>
        </div>
        <CardTitle className="text-2xl font-elegant text-foreground">Plant-Based Options</CardTitle>
        <div className="w-16 h-0.5 bg-gradient-to-r from-green-500/40 to-green-400/40 mx-auto mt-3 rounded-full"></div>
        <p className="text-xs text-muted-foreground mt-2 italic">Wholesome & delicious alternatives</p>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="bg-green-50/30 dark:bg-green-950/20 rounded-lg p-4 border border-green-500/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantBasedItems.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-green-500/10 transition-all duration-200 group cursor-default">
                <h4 className="text-sm font-medium text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantBasedCard;