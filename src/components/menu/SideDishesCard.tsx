import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SideDishesCard = () => {
  const riceComfortSides = [
    "White Rice",
    "Yellow Rice",
    "Dirty Rice",
    "Rice w/ Peas",
    "Rice w/ Gravy",
    "Mashed Potatoes & Gravy",
    "Yams",
    "Macaroni & Cheese",
    "Baked Beans"
  ];

  const freshSaladsVegetables = [
    "Green Beans w/ Potatoes",
    "Sweet Peas w/ Corn",
    "Cabbage",
    "Vegetable Medley",
    "Corn",
    "Garden Salad",
    "Caesar Salad",
    "Macaroni Salad",
    "Potato Salad"
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border border-secondary/20 hover:border-secondary/40 relative overflow-hidden group">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-18 h-18 bg-gradient-to-bl from-secondary/15 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-3 mx-auto">
          <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-secondary/40 rounded-full" />
          </div>
        </div>
        <CardTitle className="text-2xl font-elegant text-foreground">Perfect Sides</CardTitle>
        <div className="w-16 h-0.5 bg-gradient-to-r from-secondary/40 to-accent/40 mx-auto mt-3 rounded-full"></div>
        <p className="text-xs text-muted-foreground mt-2 italic">Complete your meal</p>
      </CardHeader>
      <CardContent className="space-y-8 relative z-10">
        {/* Rice & Comfort Sides */}
        <div className="bg-secondary/5 rounded-lg p-5 border border-secondary/15">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Rice & Comfort Sides
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-secondary/50 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {riceComfortSides.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-md hover:bg-secondary/15 transition-all duration-200 group cursor-default">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Fresh Salads & Vegetables */}
        <div className="bg-green-50/20 dark:bg-green-950/10 rounded-lg p-5 border border-green-500/15">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Fresh Salads & Vegetables
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-green-500/50 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {freshSaladsVegetables.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-md hover:bg-green-500/10 transition-all duration-200 group cursor-default">
                <h4 className="text-sm font-medium text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SideDishesCard;