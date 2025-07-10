import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DessertsCard = () => {
  const dessertItems = [
    { name: "Brownies", desc: "Rich, fudgy brownies made from scratch" },
    { name: "Red Velvet Cake", desc: "Classic Southern favorite with cream cheese frosting" },
    { name: "Vanilla Cake", desc: "Light and fluffy vanilla cake with buttercream" },
    { name: "Chocolate Cake", desc: "Decadent chocolate cake for chocolate lovers" },
    { name: "Strawberry Cake", desc: "Fresh strawberry cake with seasonal berries" },
    { name: "Carrot Cake", desc: "Spiced carrot cake with cream cheese frosting" },
    { name: "Cheesecake", desc: "Creamy New York style cheesecake" },
    { name: "Cupcakes", desc: "Individual treats in various flavors" },
    { name: "Banana Pudding", desc: "Traditional Southern banana pudding" },
    { name: "Dessert Shooters", desc: "Mini desserts perfect for events" }
  ];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-elegant text-foreground">Tanya's Sweet Creations</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Perfect finishing touches for any celebration</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dessertItems.map((item, index) => (
            <div key={index} className="border-b border-muted/50 pb-3 last:border-b-0">
              <div>
                <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                <p className="text-muted-foreground text-xs italic mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DessertsCard;