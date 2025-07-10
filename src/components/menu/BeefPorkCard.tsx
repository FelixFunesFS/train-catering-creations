import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BeefPorkCard = () => {
  const meatItems = [
    "Brisket", "Ribs", "Pulled Pork", "Fried Pork Chops", 
    "Smothered Pork Chops", "Meatloaf", "Hamburgers", "Smoked Sausage"
  ];

  const specialtyItems = [
    { name: "Lasagna", desc: "Layered pasta with meat sauce & cheese" },
    { name: "BBQ Platters", desc: "Choice of meats with signature sides" },
    { name: "Southern Combos", desc: "Mix & match your favorite proteins" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-elegant text-foreground">Beef, Pork & Specialties</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="h-full">
        <div className="max-h-80 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">Premium Meats</h3>
            <div className="space-y-2">
              {meatItems.map((item, index) => (
                <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-2 last:border-b-0">
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 text-center">House Specialties</h3>
            <div className="space-y-3">
              {specialtyItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-3 last:border-b-0">
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

export default BeefPorkCard;