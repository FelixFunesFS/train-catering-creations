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
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Perfect Sides</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rice & Comfort Sides */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Rice & Comfort Sides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {riceComfortSides.map((item, index) => (
              <div key={index} className="text-center py-3 px-2">
                <h4 className="text-sm font-medium text-foreground">{item}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Fresh Salads & Vegetables */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-4">Fresh Salads & Vegetables</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {freshSaladsVegetables.map((item, index) => (
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

export default SideDishesCard;