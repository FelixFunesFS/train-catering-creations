import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
            Our Menu
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Savor the flavors of the South with our signature dishes, crafted with love and over 20 years of culinary expertise.
          </p>
        </div>


        {/* Card Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 max-w-8xl mx-auto">
          
          {/* Appetizers Card */}
          <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-elegant text-foreground">Appetizers</CardTitle>
              <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Charcuterie Board", desc: "Selection of artisanal meats, cheeses, and accompaniments" },
                  { name: "Chocolate Covered Fruit Platter", desc: "Fresh seasonal fruits dipped in rich chocolate" },
                  { name: "Shrimp Deviled Eggs w/Bacon Finish", desc: "Classic deviled eggs elevated with fresh shrimp and crispy bacon" },
                  { name: "Mini Chicken & Waffles", desc: "Southern comfort in bite-sized portions" },
                  { name: "Smoked Salmon Cucumber Bites", desc: "Fresh cucumber rounds topped with premium smoked salmon" },
                  { name: "Tomato Caprese", desc: "Fresh mozzarella, basil, and vine-ripened tomatoes" },
                  { name: "Mini Loaded Potatoes", desc: "Crispy potato skins loaded with cheese, bacon, and chives" },
                  { name: "Grazing Table", desc: "An abundant spread perfect for sharing" }
                 ].map((item, index) => (
                   <div key={index} className="border-b border-muted/50 pb-3 last:border-b-0">
                     <div>
                       <h4 className="font-medium text-foreground">{item.name}</h4>
                       <p className="text-muted-foreground text-sm mt-1 italic">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Courses Card */}
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
                    {[
                      "Baked/Smoked Chicken", "Barbecue Chicken", "Fried Chicken", 
                      "Chicken Tenders", "Chicken Wings", "Chicken Alfredo", "Turkey Wings"
                     ].map((item, index) => (
                       <div key={index} className="border-b border-muted/30 pb-2">
                         <span className="text-foreground text-sm">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-elegant font-semibold text-foreground mb-4 text-center">Beef & Pork</h3>
                  <div className="space-y-3">
                    {[
                      "Brisket", "Ribs", "Pulled Pork", "Fried Pork Chops", 
                      "Smothered Pork Chops", "Meatloaf", "Hamburgers", "Smoked Sausage"
                     ].map((item, index) => (
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
                  {[
                    { name: "Low Country Boil", desc: "Traditional Southern seafood boil with shrimp, sausage, corn, and potatoes" },
                    { name: "Baked Salmon", desc: "Fresh Atlantic salmon with herbs and seasonings" },
                    { name: "Fried Fish", desc: "Golden fried fish fillets with our signature seasoning" },
                    { name: "Shrimp Alfredo", desc: "Succulent shrimp in creamy alfredo sauce over pasta" },
                    { name: "Crabs", desc: "Fresh crabs prepared to perfection" },
                    { name: "Lasagna", desc: "Layers of pasta, meat sauce, and melted cheese" }
                   ].map((item, index) => (
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

          {/* Side Dishes Card */}
          <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-elegant text-foreground">Side Dishes</CardTitle>
              <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 text-center">Rice & Grains</h3>
                  <div className="space-y-2">
                     {["White Rice", "Yellow Rice", "Dirty Rice", "Rice w/ Peas", "Rice w/ Gravy"].map((item, index) => (
                       <div key={index} className="text-sm">
                         <span className="text-foreground">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 text-center">Vegetables</h3>
                  <div className="space-y-2">
                     {["Green Beans w/ Potatoes", "Sweet Peas w/ Corn", "Cabbage", "Yams", "Vegetable Medley", "Corn"].map((item, index) => (
                       <div key={index} className="text-sm">
                         <span className="text-foreground">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 text-center">Classics</h3>
                  <div className="space-y-2">
                     {["Macaroni & Cheese", "Mashed Potatoes & Gravy", "Baked Beans", "Macaroni Salad", "Potato Salad"].map((item, index) => (
                       <div key={index} className="text-sm">
                         <span className="text-foreground">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 text-center">Fresh Salads</h3>
                  <div className="space-y-2">
                     {["Garden Salad", "Caesar Salad"].map((item, index) => (
                       <div key={index} className="text-sm">
                         <span className="text-foreground">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant-Based Options Card */}
          <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-elegant text-foreground">Plant-Based Options</CardTitle>
              <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
              <p className="text-muted-foreground text-sm italic mt-2">Delicious alternatives for our vegetarian guests</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Vegetarian Patties w/ Gravy", desc: "House-made patties served with rich, savory gravy" },
                  { name: "Plant-Based Burger", desc: "Hearty veggie burger with all the fixings" },
                  { name: "Vegetarian Hot Dogs", desc: "Plant-based dogs with your choice of toppings" },
                  { name: "Vegetarian Lasagna", desc: "Layers of pasta with vegetables and cheese" },
                  { name: "Vegetarian Spaghetti", desc: "Classic pasta with marinara or pesto sauce" },
                  { name: "Vegetarian Meatloaf", desc: "Plant-based comfort food that satisfies" }
                 ].map((item, index) => (
                   <div key={index} className="border-b border-muted/50 pb-3 last:border-b-0">
                     <div>
                       <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                       <p className="text-muted-foreground text-xs italic mt-1">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
          {/* Tanya's Sweet Creations Card */}
          <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-elegant text-foreground">Tanya's Sweet Creations</CardTitle>
              <div className="w-12 h-0.5 bg-gradient-primary mx-auto mt-2"></div>
              <p className="text-muted-foreground text-sm italic mt-2">Perfect finishing touches for any celebration</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Brownies", desc: "Rich, fudgy brownies made from scratch" },
                  { name: "Red Velvet Cake", desc: "Classic Southern favorite with cream cheese frosting" },
                  { name: "Vanilla Cake", desc: "Light and fluffy vanilla cake with buttercream" },
                  { name: "Chocolate Cake", desc: "Decadent chocolate cake for chocolate lovers" },
                  { name: "Strawberry Cake", desc: "Fresh strawberry cake with seasonal berries" },
                  { name: "Carrot Cake", desc: "Spiced carrot cake with cream cheese frosting" },
                  { name: "Cheesecake", desc: "Creamy New York style cheesecake" },
                  { name: "Cupcakes", desc: "Individual treats in various flavors" },
                  { name: "Banana Pudding", desc: "Traditional Southern banana pudding" },
                  { name: "Dessert Shooters", desc: "Mini desserts perfect for events" }
                ].map((item, index) => (
                  <div key={index} className="border-b border-muted/50 pb-3 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                      <p className="text-muted-foreground text-xs italic mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact for Custom Menu */}
        <Card className="shadow-elegant bg-gradient-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
              Custom Menu Planning
            </h3>
            <p className="text-muted-foreground mb-6">
              Every event is unique. Let us create a customized menu that perfectly fits your occasion, dietary needs, and budget.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
              <a href="tel:8439700265" className="text-primary hover:text-primary-glow font-medium">
                Call (843) 970-0265
              </a>
              <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium">
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Menu;