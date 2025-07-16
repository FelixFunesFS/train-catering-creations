import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EntreesCard = () => {
  const poultryItems = [
    "Baked/Smoked Chicken",
    "Barbecue Chicken",
    "Chicken Tenders",
    "Turkey Wings",
    "Chicken Alfredo",
    "Fried Chicken",
    "Chicken Wings"
  ];

  const beefPorkItems = [
    "Smoked Sausage",
    "Fried Pork Chops",
    "Smothered Pork Chops",
    "Pulled Pork",
    "Ribs",
    "Meatloaf",
    "Brisket",
    "Hamburgers",
    "Spaghetti",
    "Lasagna",
    "Tacos"
  ];

  const seafoodItems = [
    "Baked Salmon",
    "Shrimp Alfredo",
    "Low Country Boil",
    "Crabs",
    "Fried Fish"
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border border-primary/20 hover:border-primary/40 relative overflow-hidden group">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 mx-auto">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-primary/40 rounded-full" />
          </div>
        </div>
        <CardTitle className="text-2xl font-elegant text-foreground">Main Entrees</CardTitle>
        <div className="w-16 h-0.5 bg-gradient-primary mx-auto mt-3 rounded-full"></div>
        <p className="text-xs text-muted-foreground mt-2 italic">Hearty & satisfying selections</p>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-8">
          {/* Poultry Section */}
          <div className="bg-accent/5 rounded-lg p-5 border border-accent/15">
            <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
              Poultry
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-accent/50 rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {poultryItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-3 rounded-md hover:bg-accent/15 transition-all duration-200 group cursor-default">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Beef & Pork Section */}
          <div className="bg-primary/5 rounded-lg p-5 border border-primary/15">
            <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
              Beef & Pork
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary/50 rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {beefPorkItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-3 rounded-md hover:bg-primary/15 transition-all duration-200 group cursor-default">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Seafood Section */}
          <div className="bg-secondary/5 rounded-lg p-5 border border-secondary/15">
            <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
              Seafood
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-secondary/50 rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {seafoodItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-3 rounded-md hover:bg-secondary/15 transition-all duration-200 group cursor-default">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntreesCard;