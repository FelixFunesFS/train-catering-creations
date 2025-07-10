import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BeefPorkCard = () => {
  const meatItems = [
    "Brisket", "Ribs", "Pulled Pork", "Fried Pork Chops", 
    "Smothered Pork Chops", "Meatloaf", "Hamburgers", "Smoked Sausage"
  ];

  const specialtyItems = [
    { name: "Lasagna", desc: "Layers of pasta, meat sauce, and melted cheese" },
    { name: "BBQ Platters", desc: "Choice of meats with signature sides" },
    { name: "Southern Combos", desc: "Mix and match your favorite proteins" }
  ];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-elegant text-foreground">Beef, Pork & Specialties</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 text-center">Premium Meats</h3>
          <div className="space-y-2">
            {meatItems.map((item, index) => (
              <div key={index} className="text-sm text-foreground border-b border-muted/30 pb-1 last:border-b-0">
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 text-center">House Specialties</h3>
          <div className="space-y-3">
            {specialtyItems.map((item, index) => (
              <div key={index} className="border-b border-muted/30 pb-2 last:border-b-0">
                <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                <p className="text-muted-foreground text-xs italic mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeefPorkCard;