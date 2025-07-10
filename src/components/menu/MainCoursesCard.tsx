import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MainCoursesCard = () => {
  const poultryItems = [
    "Baked/Smoked Chicken", "Barbecue Chicken", "Fried Chicken", 
    "Chicken Tenders", "Chicken Wings", "Chicken Alfredo", "Turkey Wings"
  ];

  const meatItems = [
    "Brisket", "Ribs", "Pulled Pork", "Fried Pork Chops", 
    "Smothered Pork Chops", "Meatloaf", "Hamburgers", "Smoked Sausage"
  ];

  const seafoodItems = [
    { name: "Low Country Boil", desc: "Traditional Southern seafood boil with shrimp, sausage, corn, and potatoes" },
    { name: "Baked Salmon", desc: "Fresh Atlantic salmon with herbs and seasonings" },
    { name: "Fried Fish", desc: "Golden fried fish fillets with our signature seasoning" },
    { name: "Shrimp Alfredo", desc: "Succulent shrimp in creamy alfredo sauce over pasta" },
    { name: "Crabs", desc: "Fresh crabs prepared to perfection" },
    { name: "Lasagna", desc: "Layers of pasta, meat sauce, and melted cheese" }
  ];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 xl:col-span-2">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-elegant text-foreground">Main Courses</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-elegant font-semibold text-foreground mb-4 text-center">Poultry & Fowl</h3>
            <div className="space-y-3">
              {poultryItems.map((item, index) => (
                <div key={index} className="border-b border-muted/30 pb-2">
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-elegant font-semibold text-foreground mb-4 text-center">Beef & Pork</h3>
            <div className="space-y-3">
              {meatItems.map((item, index) => (
                <div key={index} className="border-b border-muted/30 pb-2">
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-elegant font-semibold text-foreground mb-4 text-center">Seafood & Specialties</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {seafoodItems.map((item, index) => (
              <div key={index} className="border-b border-muted/30 pb-3">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                  <p className="text-muted-foreground text-xs italic mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainCoursesCard;