import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

        {/* Proteins Section */}
        <div className="mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl font-elegant text-center text-primary">Proteins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="font-medium">Baked/Smoked Chicken</div>
                  <div className="font-medium">Barbecue Chicken</div>
                  <div className="font-medium">Chicken Tenders</div>
                  <div className="font-medium">Turkey Wings</div>
                  <div className="font-medium">Chicken Alfredo</div>
                  <div className="font-medium">Meatloaf</div>
                  <div className="font-medium">Brisket</div>
                  <div className="font-medium">Hamburgers</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Smoked Sausage</div>
                  <div className="font-medium">Fried Pork Chops</div>
                  <div className="font-medium">Smothered Pork Chops</div>
                  <div className="font-medium">Pull Pork</div>
                  <div className="font-medium">Ribs</div>
                  <div className="font-medium">Low Country Boil</div>
                  <div className="font-medium">Fried Chicken</div>
                  <div className="font-medium">Fried Fish</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Baked Salmon</div>
                  <div className="font-medium">Shrimp Alfredo</div>
                  <div className="font-medium">Spaghetti</div>
                  <div className="font-medium">Lasagna</div>
                  <div className="font-medium">Tacos</div>
                  <div className="font-medium">Chicken Wings</div>
                  <div className="font-medium">Crabs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sides Section */}
        <div className="mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl font-elegant text-center text-primary">Sides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="font-medium">Macaroni Salad</div>
                  <div className="font-medium">Potato Salad</div>
                  <div className="font-medium">Sweet Peas w/ Corn</div>
                  <div className="font-medium">Green Beans w/ Potatoes</div>
                  <div className="font-medium">Yams</div>
                  <div className="font-medium">White Rice</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Yellow Rice</div>
                  <div className="font-medium">Dirty Rice</div>
                  <div className="font-medium">Rice w/ Peas</div>
                  <div className="font-medium">Rice w/ Gravy</div>
                  <div className="font-medium">Macaroni & Cheese</div>
                  <div className="font-medium">Cabbage</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Garden Salad</div>
                  <div className="font-medium">Caesar Salad</div>
                  <div className="font-medium">Baked Beans</div>
                  <div className="font-medium">Mashed Potatoes & Gravy</div>
                  <div className="font-medium">Corn</div>
                  <div className="font-medium">Vegetable Medley</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appetizers Section */}
        <div className="mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl font-elegant text-center text-primary">Appetizers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="font-medium">Fruit Platter</div>
                  <div className="font-medium">Cheese Platter</div>
                  <div className="font-medium">Meat Platter</div>
                  <div className="font-medium">Charcuterie Board</div>
                  <div className="font-medium">Tuna Salad</div>
                  <div className="font-medium">Grazing Table</div>
                  <div className="font-medium">Chocolate Covered Fruit Platter</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Chicken Sliders</div>
                  <div className="font-medium">Pulled Pork Sliders</div>
                  <div className="font-medium">Meatballs</div>
                  <div className="font-medium">Deviled Eggs</div>
                  <div className="font-medium">Chicken Salad</div>
                  <div className="font-medium">Vegetable Platter</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Mini Chicken & Waffles</div>
                  <div className="font-medium">Tomato Caprese</div>
                  <div className="font-medium">Mini Loaded Potatoes</div>
                  <div className="font-medium">Tomato Bruschetta</div>
                  <div className="font-medium">Shrimp Deviled Eggs w/Bacon Finish</div>
                  <div className="font-medium">Smoked Salmon Cucumber Bites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vegetarian Options Section */}
        <div className="mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl font-elegant text-center text-primary">Vegetarian Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="font-medium">Patties w/ Gravy (V)</div>
                  <div className="font-medium">Burger (V)</div>
                  <div className="font-medium">Hot Dogs (V)</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Lasagna (V)</div>
                  <div className="font-medium">Spaghetti (V)</div>
                  <div className="font-medium">Meat Loaf (V)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desserts Section */}
        <div className="mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl font-elegant text-center text-primary">Desserts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="font-medium">Brownies</div>
                  <div className="font-medium">Red Velvet Cake</div>
                  <div className="font-medium">Vanilla Cake</div>
                  <div className="font-medium">Chocolate Cake</div>
                  <div className="font-medium">Strawberry Cake</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Carrot Cake</div>
                  <div className="font-medium">Cheesecake</div>
                  <div className="font-medium">Cupcakes</div>
                  <div className="font-medium">Banana Pudding</div>
                  <div className="font-medium">Dessert Shooters</div>
                </div>
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