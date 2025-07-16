import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SideDishesCard = () => {
  const comfortClassics = [
    "Macaroni & Cheese",
    "Mashed Potatoes & Gravy",
    "White Rice",
    "Yellow Rice",
    "Dirty Rice",
    "Rice w/ Peas",
    "Rice w/ Gravy",
    "Yams",
    "Baked Beans",
    "Potato Salad"
  ];

  const freshAndLight = [
    "Garden Salad",
    "Caesar Salad",
    "Macaroni Salad",
    "Green Beans w/ Potatoes",
    "Sweet Peas w/ Corn",
    "Cabbage",
    "Vegetable Medley",
    "Corn"
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
        {/* Comfort Classics */}
        <div className="bg-amber-500/5 rounded-lg p-6 border border-amber-500/15">
          <h3 className="text-xl font-elegant text-center text-foreground mb-8 relative">
            Comfort Classics
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-amber-500/60 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {comfortClassics.map((item, index) => (
              <div key={index} className="text-center py-4 px-4 rounded-lg hover:bg-amber-500/15 transition-all duration-200 group cursor-default border border-transparent hover:border-amber-500/20">
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Fresh & Light */}
        <div className="bg-emerald-500/5 rounded-lg p-6 border border-emerald-500/15">
          <h3 className="text-xl font-elegant text-center text-foreground mb-8 relative">
            Fresh & Light
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-emerald-500/60 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {freshAndLight.map((item, index) => (
              <div key={index} className="text-center py-4 px-4 rounded-lg hover:bg-emerald-500/15 transition-all duration-200 group cursor-default border border-transparent hover:border-emerald-500/20">
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SideDishesCard;