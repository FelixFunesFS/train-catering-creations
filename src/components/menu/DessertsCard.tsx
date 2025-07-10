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
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-2 border-primary/10">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-4xl font-elegant text-foreground mb-2">Tanya's Sweet Creations</CardTitle>
        <div className="w-32 h-1 bg-gradient-primary mx-auto mt-4"></div>
        <p className="text-muted-foreground text-lg italic mt-4 max-w-2xl mx-auto">
          Perfect finishing touches for any celebration - handcrafted with love and 20 years of baking expertise
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dessertItems.map((item, index) => (
            <div key={index} className="bg-background/70 rounded-xl p-6 border border-muted/30 hover:shadow-glow hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-sm font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{item.name}</h4>
              <p className="text-xs text-muted-foreground italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DessertsCard;