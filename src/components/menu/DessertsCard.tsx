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
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-elegant text-foreground">Tanya's Sweet Creations</CardTitle>
        <div className="w-24 h-1 bg-gradient-primary mx-auto mt-3"></div>
        <p className="text-muted-foreground text-base italic mt-3">Perfect finishing touches for any celebration</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dessertItems.map((item, index) => (
            <div key={index} className="bg-background/50 rounded-lg p-4 border border-muted/20 hover:shadow-md transition-all duration-200">
              <h4 className="font-semibold text-foreground text-base mb-2">{item.name}</h4>
              <p className="text-muted-foreground text-sm italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DessertsCard;