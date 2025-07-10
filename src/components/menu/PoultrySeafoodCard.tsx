import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PoultrySeafoodCard = () => {
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

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Poultry & Seafood</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 text-center">Poultry Favorites</h3>
            <div className="space-y-2">
              {poultryItems.map((item, index) => (
                <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 text-center">Seafood & Pasta</h3>
            <div className="space-y-2">
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

export default PoultrySeafoodCard;