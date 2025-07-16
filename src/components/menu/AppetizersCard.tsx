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

  const signatureBites = [
    "Shrimp Deviled Eggs w/Bacon Finish",
    "Smoked Salmon Cucumber Bites",
    "Tomato Caprese",
    "Tomato Bruschetta",
    "Mini Chicken & Waffles",
    "Mini Loaded Potatoes",
    "Chocolate Covered Fruit Platter"
  ];

  const classicStarters = [
    "Chicken Sliders",
    "Pulled Pork Sliders",
    "Meatballs",
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
        <div className="bg-accent/5 rounded-lg p-6 border border-accent/15">
          <h3 className="text-xl font-elegant text-center text-foreground mb-8 relative">
            Platters & Boards
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-accent/60 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plattersBoards.map((item, index) => (
              <div key={index} className="text-center py-4 px-4 rounded-lg hover:bg-accent/15 transition-all duration-200 group cursor-default border border-transparent hover:border-accent/20">
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Bites */}
        <div className="bg-primary/5 rounded-lg p-6 border border-primary/15">
          <h3 className="text-xl font-elegant text-center text-foreground mb-8 relative">
            Signature Bites
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary/60 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {signatureBites.map((item, index) => (
              <div key={index} className="text-center py-4 px-4 rounded-lg hover:bg-primary/15 transition-all duration-200 group cursor-default border border-transparent hover:border-primary/20">
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Classic Starters */}
        <div className="bg-secondary/5 rounded-lg p-6 border border-secondary/15">
          <h3 className="text-xl font-elegant text-center text-foreground mb-8 relative">
            Classic Starters
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-secondary/60 rounded-full" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classicStarters.map((item, index) => (
              <div key={index} className="text-center py-4 px-4 rounded-lg hover:bg-secondary/15 transition-all duration-200 group cursor-default border border-transparent hover:border-secondary/20">
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppetizersCard;