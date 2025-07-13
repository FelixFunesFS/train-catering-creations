import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DessertsCard = () => {
  const cakeItems = [
    { name: "Red Velvet Cake", desc: "Southern favorite with cream cheese frosting" },
    { name: "Vanilla Cake", desc: "Light & fluffy with buttercream" },
    { name: "Chocolate Cake", desc: "Decadent cake for chocolate lovers" },
    { name: "Strawberry Cake", desc: "Fresh cake with seasonal berries" },
    { name: "Carrot Cake", desc: "Spiced with cream cheese frosting" }
  ];

  const specialtyDessertItems = [
    { name: "Brownies", desc: "Rich, fudgy brownies made from scratch" },
    { name: "Cheesecake", desc: "Creamy New York style" },
    { name: "Cupcakes", desc: "Individual treats in various flavors" },
    { name: "Banana Pudding", desc: "Traditional Southern favorite" },
    { name: "Dessert Shooters", desc: "Mini desserts perfect for events" }
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card border-2 border-primary/10">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Tanya's Sweet Creations</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">
          Perfect finishing touches for any celebration - handcrafted with love and 20 years of baking expertise
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cakes Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-3">Cakes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cakeItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialty Desserts Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-3">Specialty Desserts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {specialtyDessertItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
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