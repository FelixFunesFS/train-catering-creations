import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BeefPorkCard = () => {
  const meatItems = [
    { name: "Brisket", desc: "Slow-smoked tender beef" },
    { name: "Ribs", desc: "Fall-off-the-bone BBQ" },
    { name: "Pulled Pork", desc: "Smoky shredded pork" },
    { name: "Fried Pork Chops", desc: "Golden breaded chops" },
    { name: "Smothered Pork Chops", desc: "Rich gravy covered" },
    { name: "Meatloaf", desc: "Home-style comfort" },
    { name: "Hamburgers", desc: "Juicy grilled patties" },
    { name: "Smoked Sausage", desc: "Savory house-made" }
  ];

  const specialtyItems = [
    { name: "Lasagna", desc: "Layered pasta with meat sauce & cheese" },
    { name: "BBQ Platters", desc: "Choice of meats with signature sides" },
    { name: "Southern Combos", desc: "Mix & match your favorite proteins" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Beef, Pork & Specialties</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 text-center">Premium Meats</h3>
            <div className="space-y-2">
              {meatItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 text-center">House Specialties</h3>
            <div className="space-y-2">
              {specialtyItems.map((item, index) => (
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

export default BeefPorkCard;