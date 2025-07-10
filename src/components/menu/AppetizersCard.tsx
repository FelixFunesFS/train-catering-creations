import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AppetizersCard = () => {
  const plattersBoards = [
    { name: "Charcuterie Board", desc: "Artisanal meats, cheeses & accompaniments" },
    { name: "Grazing Table", desc: "Abundant spread perfect for sharing" },
    { name: "Fruit Platter", desc: "Fresh seasonal fruits beautifully arranged" },
    { name: "Cheese Platter", desc: "Selection of fine cheeses with crackers" },
    { name: "Meat Platter", desc: "Assorted premium deli meats" },
    { name: "Vegetable Platter", desc: "Fresh crisp vegetables with dip" }
  ];

  const gourmetBites = [
    { name: "Shrimp Deviled Eggs w/Bacon Finish", desc: "Elevated with shrimp & crispy bacon" },
    { name: "Smoked Salmon Cucumber Bites", desc: "Premium salmon on fresh cucumber" },
    { name: "Tomato Caprese", desc: "Fresh mozzarella, basil & vine-ripened tomatoes" },
    { name: "Tomato Bruschetta", desc: "Toasted bread with fresh tomato topping" },
    { name: "Chocolate Covered Fruit Platter", desc: "Fresh seasonal fruits in rich chocolate" }
  ];

  const heartyBites = [
    { name: "Mini Chicken & Waffles", desc: "Southern comfort in bite-sized portions" },
    { name: "Mini Loaded Potatoes", desc: "Crispy skins with cheese, bacon & chives" },
    { name: "Chicken Sliders", desc: "Mini sandwiches with tender chicken" },
    { name: "Pulled Pork Sliders", desc: "Smoky pork on mini buns" },
    { name: "Meatballs", desc: "Homestyle meatballs in savory sauce" }
  ];

  const classicFavorites = [
    { name: "Deviled Eggs", desc: "Traditional Southern-style deviled eggs" },
    { name: "Chicken Salad", desc: "Creamy chicken salad with celery & herbs" },
    { name: "Tuna Salad", desc: "Classic tuna salad with fresh herbs" }
  ];

  return (
    <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
        <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platters & Boards */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-3">Platters & Boards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plattersBoards.map((item, index) => (
              <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gourmet Bites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-3">Gourmet Bites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gourmetBites.map((item, index) => (
              <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hearty Bites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-3">Hearty Bites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {heartyBites.map((item, index) => (
              <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Classic Favorites */}
        <div>
          <h3 className="text-lg font-elegant text-center text-foreground mb-3">Classic Favorites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classicFavorites.map((item, index) => (
              <div key={index} className="border-b border-muted/40 pb-2 last:border-b-0">
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

export default AppetizersCard;