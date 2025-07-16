import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AppetizersCard = () => {
  const plattersBoards = [
    "Charcuterie Board",
    "Grazing Table", 
    "Fruit Platter",
    "Cheese Platter",
    "Meat Platter",
    "Vegetable Platter"
  ];

  const gourmetBites = [
    "Shrimp Deviled Eggs w/Bacon Finish",
    "Smoked Salmon Cucumber Bites",
    "Tomato Caprese",
    "Tomato Bruschetta",
    "Chocolate Covered Fruit Platter"
  ];

  const heartyBites = [
    "Mini Chicken & Waffles",
    "Mini Loaded Potatoes",
    "Chicken Sliders",
    "Pulled Pork Sliders",
    "Meatballs"
  ];

  const classicFavorites = [
    "Deviled Eggs",
    "Chicken Salad",
    "Tuna Salad"
  ];

  return (
    <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border border-accent/20 hover:border-primary/30 relative overflow-hidden group">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-full" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 mx-auto">
          <div className="w-6 h-6 bg-primary/20 rounded-full" />
        </div>
        <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
        <div className="w-16 h-0.5 bg-gradient-primary mx-auto mt-3 rounded-full"></div>
        <p className="text-xs text-muted-foreground mt-2 italic">Start your culinary journey</p>
      </CardHeader>
      <CardContent className="space-y-8 relative z-10">
        {/* Platters & Boards */}
        <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Platters & Boards
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-accent/40 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plattersBoards.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-accent/10 transition-colors duration-200 group">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Gourmet Bites */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Gourmet Bites
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary/40 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gourmetBites.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-primary/10 transition-colors duration-200 group">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Hearty Bites */}
        <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Hearty Bites
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-secondary/40 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {heartyBites.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-secondary/10 transition-colors duration-200 group">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Classic Favorites */}
        <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
          <h3 className="text-lg font-elegant text-center text-foreground mb-6 relative">
            Classic Favorites
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-muted-foreground/40 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classicFavorites.map((item, index) => (
              <div key={index} className="text-center py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors duration-200 group">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppetizersCard;