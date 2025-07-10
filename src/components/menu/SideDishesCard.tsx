import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SideDishesCard = () => {
  const riceItems = ["White Rice", "Yellow Rice", "Dirty Rice", "Rice w/ Peas", "Rice w/ Gravy"];
  const vegetableItems = ["Green Beans w/ Potatoes", "Sweet Peas w/ Corn", "Cabbage", "Yams", "Vegetable Medley", "Corn"];
  const classicItems = ["Macaroni & Cheese", "Mashed Potatoes & Gravy", "Baked Beans"];
  const saladItems = ["Garden Salad", "Caesar Salad", "Macaroni Salad", "Potato Salad"];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-elegant text-foreground">Perfect Sides</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Complement your meal with our signature sides</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="max-h-80 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 text-center">Rice & Grains</h3>
              <div className="space-y-2">
                {riceItems.map((item, index) => (
                  <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-2 last:border-b-0">{item}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 text-center">Southern Classics</h3>
              <div className="space-y-2">
                {classicItems.map((item, index) => (
                  <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-2 last:border-b-0">{item}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 text-center">Fresh Vegetables</h3>
              <div className="space-y-2">
                {vegetableItems.map((item, index) => (
                  <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-2 last:border-b-0">{item}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 text-center">Salads</h3>
              <div className="space-y-2">
                {saladItems.map((item, index) => (
                  <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-2 last:border-b-0">{item}</div>
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