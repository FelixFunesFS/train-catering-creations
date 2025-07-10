import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SideDishesCard = () => {
  const riceItems = ["White Rice", "Yellow Rice", "Dirty Rice", "Rice w/ Peas", "Rice w/ Gravy"];
  const vegetableItems = ["Green Beans w/ Potatoes", "Sweet Peas w/ Corn", "Cabbage", "Yams", "Vegetable Medley", "Corn"];
  const classicItems = ["Macaroni & Cheese", "Mashed Potatoes & Gravy", "Baked Beans", "Macaroni Salad", "Potato Salad"];
  const saladItems = ["Garden Salad", "Caesar Salad"];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-elegant text-foreground">Side Dishes</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Rice & Grains</h3>
              <div className="space-y-1">
                {riceItems.map((item, index) => (
                  <div key={index} className="text-xs text-foreground">{item}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Classics</h3>
              <div className="space-y-1">
                {classicItems.map((item, index) => (
                  <div key={index} className="text-xs text-foreground">{item}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Vegetables</h3>
              <div className="space-y-1">
                {vegetableItems.map((item, index) => (
                  <div key={index} className="text-xs text-foreground">{item}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Fresh Salads</h3>
              <div className="space-y-1">
                {saladItems.map((item, index) => (
                  <div key={index} className="text-xs text-foreground">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SideDishesCard;