import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EntreesCard = () => {
  const poultryItems = [
    { name: "Baked Chicken", desc: "Herb-seasoned oven-baked" },
    { name: "Smoked Chicken", desc: "Slow-smoked perfection" },
    { name: "Barbecue Chicken", desc: "Tangy BBQ glazed" },
    { name: "Fried Chicken", desc: "Golden crispy coating" },
    { name: "Chicken Tenders", desc: "Hand-breaded strips" },
    { name: "Chicken Wings", desc: "Choice of sauces" },
    { name: "Turkey Wings", desc: "Seasoned and tender" }
  ];

  const seafoodItems = [
    { name: "Chicken Alfredo", desc: "Creamy alfredo pasta with tender chicken" },
    { name: "Low Country Boil", desc: "Traditional Southern seafood medley" },
    { name: "Baked Salmon", desc: "Fresh Atlantic salmon with herbs" },
    { name: "Fried Fish", desc: "Golden fried fish fillets" },
    { name: "Shrimp Alfredo", desc: "Succulent shrimp in creamy alfredo" },
    { name: "Fresh Crabs", desc: "Prepared to perfection" }
  ];

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
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Main Entrees</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Our signature proteins and specialties</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...poultryItems, ...seafoodItems, ...meatItems, ...specialtyItems].map((item, index) => (
            <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
              <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntreesCard;