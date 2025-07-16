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
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Main Entrees</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Poultry Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-4">Poultry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {poultryItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-2">
                  <h4 className="text-sm font-medium text-foreground">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Beef & Pork Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-4">Beef & Pork</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {beefPorkItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-2">
                  <h4 className="text-sm font-medium text-foreground">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Seafood Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-4">Seafood</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {seafoodItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-2">
                  <h4 className="text-sm font-medium text-foreground">{item}</h4>
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