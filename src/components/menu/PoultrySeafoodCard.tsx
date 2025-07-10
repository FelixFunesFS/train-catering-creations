import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PoultrySeafoodCard = () => {
  const poultryItems = [
    "Baked/Smoked Chicken", "Barbecue Chicken", "Fried Chicken", 
    "Chicken Tenders", "Chicken Wings", "Chicken Alfredo", "Turkey Wings"
  ];

  const seafoodItems = [
    { name: "Low Country Boil", desc: "Traditional Southern seafood boil" },
    { name: "Baked Salmon", desc: "Fresh Atlantic salmon with herbs" },
    { name: "Fried Fish", desc: "Golden fried fish fillets" },
    { name: "Shrimp Alfredo", desc: "Succulent shrimp in creamy alfredo" },
    { name: "Fresh Crabs", desc: "Prepared to perfection" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-elegant text-foreground">Poultry & Seafood</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 text-center">Poultry Favorites</h3>
          <div className="space-y-2">
            {poultryItems.map((item, index) => (
              <div key={index} className="text-sm text-foreground border-b border-muted/40 pb-3 last:border-b-0">
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 text-center">Fresh Seafood</h3>
          <div className="space-y-4">
            {seafoodItems.map((item, index) => (
              <div key={index} className="border-b border-muted/40 pb-3 last:border-b-0">
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoultrySeafoodCard;