import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DessertsCard = () => {
  const dessertItems = [
    { name: "Brownies", desc: "Rich, fudgy brownies made from scratch" },
    { name: "Red Velvet Cake", desc: "Southern favorite with cream cheese frosting" },
    { name: "Vanilla Cake", desc: "Light & fluffy with buttercream" },
    { name: "Chocolate Cake", desc: "Decadent cake for chocolate lovers" },
    { name: "Strawberry Cake", desc: "Fresh cake with seasonal berries" },
    { name: "Carrot Cake", desc: "Spiced with cream cheese frosting" },
    { name: "Cheesecake", desc: "Creamy New York style" },
    { name: "Cupcakes", desc: "Individual treats in various flavors" },
    { name: "Banana Pudding", desc: "Traditional Southern favorite" },
    { name: "Dessert Shooters", desc: "Mini desserts perfect for events" }
  ];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-2 border-primary/10">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-3xl font-elegant text-foreground mb-2">Tanya's Sweet Creations</CardTitle>
        <div className="w-24 h-1 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-base italic mt-2 max-w-2xl mx-auto">
          Perfect finishing touches for any celebration - handcrafted with love and 20 years of baking expertise
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dessertItems.map((item, index) => (
            <div key={index} className="bg-background/70 rounded-xl p-3 border border-muted/30 hover:shadow-glow hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
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