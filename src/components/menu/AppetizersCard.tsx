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
    <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platters & Boards */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Platters & Boards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plattersBoards.map((item, index) => (
              <div key={index} className="text-center py-3 px-2">
                <h4 className="text-sm font-medium text-foreground">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Gourmet Bites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Gourmet Bites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gourmetBites.map((item, index) => (
              <div key={index} className="text-center py-3 px-2">
                <h4 className="text-sm font-medium text-foreground">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Hearty Bites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Hearty Bites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {heartyBites.map((item, index) => (
              <div key={index} className="text-center py-3 px-2">
                <h4 className="text-sm font-medium text-foreground">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Classic Favorites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Classic Favorites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classicFavorites.map((item, index) => (
              <div key={index} className="text-center py-3 px-2">
                <h4 className="text-sm font-medium text-foreground">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppetizersCard;