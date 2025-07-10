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

        {/* Note */}
        <div className="text-center mb-12">
          <Card className="bg-primary-light border-primary">
            <CardContent className="p-6">
              <p className="text-primary font-medium">
                Full menu details will be provided shortly. Contact us for current offerings and custom menu options.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Proteins */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Proteins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked/Smoked Chicken</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Barbecue Chicken</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Tenders</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Turkey Wings</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Alfredo</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meatloaf</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Brisket</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Hamburgers</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smoked Sausage</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Pork Chops</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smothered Pork Chops</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Pull Pork</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Ribs</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Low Country Boil</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Chicken</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Fish</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked Salmon</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Shrimp Alfredo</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Spaghetti</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Lasagna</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tacos</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Wings</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Crabs</span>
              </div>
            </CardContent>
          </Card>

          {/* Sides */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Sides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Macaroni Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Potato Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Sweet Peas w/ Corn</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Green Beans w/ Potatoes</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Yams</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">White Rice</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Yellow Rice</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Dirty Rice</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Rice w/ Peas</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Rice w/ Gravy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Macaroni & Cheese</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cabbage</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Garden Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Caesar Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked Beans</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mashed Potatoes & Gravy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Corn</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetable Medley</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appetizers & Vegetarian Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Appetizers */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Appetizers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fruit Platter</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cheese Platter</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meat Platter</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Charcuterie Board</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tuna Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Grazing Table</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chocolate Covered Fruit Platter</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Sliders</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Pulled Pork Sliders</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meatballs</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Deviled Eggs</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Salad</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetable Platter</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mini Chicken & Waffles</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tomato Caprese</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mini Loaded Potatoes</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tomato Bruschetta</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Shrimp Deviled Eggs w/Bacon Finish</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smoked Salmon Cucumber Bites</span>
              </div>
            </CardContent>
          </Card>

          {/* Vegetarian Options */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Vegetarian Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Patties w/ Gravy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Burger</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Hot Dogs</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Lasagna</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Spaghetti</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meat Loaf</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desserts */}
        <Card className="shadow-elegant mb-12">
          <CardHeader>
            <CardTitle className="text-3xl font-elegant text-center">Tanya's Sweet Creations</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Our talented Pastry Chef Tanya creates the perfect finishing touch for any celebration:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-foreground">
              <span className="font-medium">Brownies</span>
              <span className="font-medium">Red Velvet Cake</span>
              <span className="font-medium">Vanilla Cake</span>
              <span className="font-medium">Chocolate Cake</span>
              <span className="font-medium">Strawberry Cake</span>
              <span className="font-medium">Carrot Cake</span>
              <span className="font-medium">Cheesecake</span>
              <span className="font-medium">Cupcakes</span>
              <span className="font-medium">Banana Pudding</span>
              <span className="font-medium">Dessert Shooters</span>
            </div>
          </CardContent>
        </Card>

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