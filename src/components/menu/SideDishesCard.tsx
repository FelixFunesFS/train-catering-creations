import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SideDishesCard = () => {
  const allSideItems = [
    { name: "White Rice", desc: "Fluffy steamed rice" },
    { name: "Yellow Rice", desc: "Seasoned with saffron" },
    { name: "Dirty Rice", desc: "Cajun-style with meat" },
    { name: "Rice w/ Peas", desc: "Caribbean style" },
    { name: "Rice w/ Gravy", desc: "Savory brown gravy" },
    { name: "Green Beans w/ Potatoes", desc: "Southern comfort" },
    { name: "Sweet Peas w/ Corn", desc: "Garden fresh medley" },
    { name: "Cabbage", desc: "Seasoned tender greens" },
    { name: "Yams", desc: "Sweet candied style" },
    { name: "Vegetable Medley", desc: "Seasonal mix" },
    { name: "Corn", desc: "Buttered kernels" },
    { name: "Macaroni & Cheese", desc: "Creamy baked perfection" },
    { name: "Mashed Potatoes & Gravy", desc: "Smooth and rich" },
    { name: "Baked Beans", desc: "Sweet molasses style" },
    { name: "Garden Salad", desc: "Fresh mixed greens" },
    { name: "Caesar Salad", desc: "Classic romaine & parmesan" },
    { name: "Macaroni Salad", desc: "Creamy pasta salad" },
    { name: "Potato Salad", desc: "Traditional Southern style" }
  ];

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Perfect Sides</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
        <p className="text-muted-foreground text-sm italic mt-2">Complement your meal with our signature sides</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allSideItems.map((item, index) => (
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

export default SideDishesCard;