import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EntreesCard = () => {
  const poultryItems = [
    { name: "Baked/Smoked Chicken", desc: "Herb-seasoned oven-baked or slow-smoked" },
    { name: "Barbecue Chicken", desc: "Tangy BBQ glazed" },
    { name: "Chicken Tenders", desc: "Hand-breaded strips" },
    { name: "Turkey Wings", desc: "Seasoned and tender" },
    { name: "Chicken Alfredo", desc: "Creamy alfredo pasta with tender chicken" },
    { name: "Fried Chicken", desc: "Golden crispy coating" },
    { name: "Chicken Wings", desc: "Choice of sauces" }
  ];

  const beefPorkItems = [
    { name: "Smoked Sausage", desc: "Savory house-made" },
    { name: "Fried Pork Chops", desc: "Golden breaded chops" },
    { name: "Smothered Pork Chops", desc: "Rich gravy covered" },
    { name: "Pulled Pork", desc: "Smoky shredded pork" },
    { name: "Ribs", desc: "Fall-off-the-bone BBQ" },
    { name: "Meatloaf", desc: "Home-style comfort" },
    { name: "Brisket", desc: "Slow-smoked tender beef" },
    { name: "Hamburgers", desc: "Juicy grilled patties" },
    { name: "Spaghetti", desc: "Classic pasta with meat sauce" },
    { name: "Lasagna", desc: "Layered pasta with meat sauce & cheese" },
    { name: "Tacos", desc: "Traditional seasoned beef tacos" }
  ];

  const seafoodItems = [
    { name: "Baked Salmon", desc: "Fresh Atlantic salmon with herbs" },
    { name: "Shrimp Alfredo", desc: "Succulent shrimp in creamy alfredo" },
    { name: "Low Country Boil", desc: "Traditional Southern seafood medley" },
    { name: "Crabs", desc: "Prepared to perfection" },
    { name: "Fried Fish", desc: "Golden fried fish fillets" }
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-200 hover:scale-[1.01] bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Main Entrees</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Our signature proteins and specialties</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Poultry Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-3">Poultry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {poultryItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Beef & Pork Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-3">Beef & Pork</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {beefPorkItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seafood Section */}
          <div>
            <h3 className="text-lg font-elegant text-center text-foreground mb-3">Seafood</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {seafoodItems.map((item, index) => (
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

export default EntreesCard;