import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DessertsCard = () => {
  const cakeItems = [
    "Red Velvet Cake",
    "Vanilla Cake",
    "Chocolate Cake",
    "Strawberry Cake",
    "Carrot Cake"
  ];

  const specialtyDessertItems = [
    "Brownies",
    "Cheesecake",
    "Cupcakes",
    "Banana Pudding",
    "Dessert Shooters"
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card border-2 border-primary/10">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Tanya's Sweet Creations</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">
          Handcrafted with love and 20 years of baking expertise
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cakes Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-4">Cakes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cakeItems.map((item, index) => (
                <div key={index} className="text-center py-3 px-2">
                  <h4 className="text-sm font-medium text-foreground">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Specialty Desserts Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-4">Specialty Desserts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {specialtyDessertItems.map((item, index) => (
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

export default DessertsCard;