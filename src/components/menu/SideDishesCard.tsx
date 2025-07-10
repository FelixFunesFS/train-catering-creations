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
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">Rice & Grains</h3>
            <div className="space-y-2">
              {riceItems.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">Vegetables</h3>
            <div className="space-y-2">
              {vegetableItems.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">Classics</h3>
            <div className="space-y-2">
              {classicItems.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">Fresh Salads</h3>
            <div className="space-y-2">
              {saladItems.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SideDishesCard;