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
    <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background via-primary/5 to-accent/10 border-2 border-primary/30 hover:border-primary/50 relative overflow-hidden group">
      {/* Special decorative elements for desserts */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-accent/20 to-transparent rounded-tl-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
          <div className="w-10 h-10 bg-primary/25 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-primary/50 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
        </div>
        <CardTitle className="text-3xl font-elegant text-foreground mb-2">Tanya's Sweet Creations</CardTitle>
        <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        <p className="text-muted-foreground text-sm italic mt-3 px-4">
          Handcrafted with love and 20 years of baking expertise
        </p>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-8">
          {/* Cakes Section */}
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
            <h3 className="text-xl font-elegant text-center text-foreground mb-6 relative">
              Signature Cakes
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary/60 rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cakeItems.map((item, index) => (
                <div key={index} className="text-center py-4 px-4 rounded-lg bg-background/50 hover:bg-primary/15 transition-all duration-200 group cursor-default border border-primary/10">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Specialty Desserts Section */}
          <div className="bg-accent/10 rounded-xl p-6 border border-accent/20">
            <h3 className="text-xl font-elegant text-center text-foreground mb-6 relative">
              Specialty Treats
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-accent/60 rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialtyDessertItems.map((item, index) => (
                <div key={index} className="text-center py-4 px-4 rounded-lg bg-background/50 hover:bg-accent/15 transition-all duration-200 group cursor-default border border-accent/10">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item}</h4>
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