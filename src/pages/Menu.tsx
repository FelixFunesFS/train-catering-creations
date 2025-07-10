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
                <span className="text-muted-foreground">Tender & juicy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Barbecue Chicken</span>
                <span className="text-muted-foreground">Smoky flavor</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Tenders</span>
                <span className="text-muted-foreground">Crispy golden</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Turkey Wings</span>
                <span className="text-muted-foreground">Seasoned to perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Alfredo</span>
                <span className="text-muted-foreground">Rich & creamy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meatloaf</span>
                <span className="text-muted-foreground">Homestyle comfort</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Brisket</span>
                <span className="text-muted-foreground">Slow-smoked tender</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Hamburgers</span>
                <span className="text-muted-foreground">Classic American</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smoked Sausage</span>
                <span className="text-muted-foreground">Authentic smokehouse</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Pork Chops</span>
                <span className="text-muted-foreground">Crispy & succulent</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smothered Pork Chops</span>
                <span className="text-muted-foreground">Gravy perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Pull Pork</span>
                <span className="text-muted-foreground">Tender & flavorful</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Ribs</span>
                <span className="text-muted-foreground">Fall-off-the-bone</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Low Country Boil</span>
                <span className="text-muted-foreground">Coastal tradition</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Chicken</span>
                <span className="text-muted-foreground">Southern classic</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fried Fish</span>
                <span className="text-muted-foreground">Fresh catch</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked Salmon</span>
                <span className="text-muted-foreground">Ocean fresh</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Shrimp Alfredo</span>
                <span className="text-muted-foreground">Creamy delight</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Spaghetti</span>
                <span className="text-muted-foreground">Italian favorite</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Lasagna</span>
                <span className="text-muted-foreground">Layered goodness</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tacos</span>
                <span className="text-muted-foreground">Customizable</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Wings</span>
                <span className="text-muted-foreground">Crispy & saucy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Crabs</span>
                <span className="text-muted-foreground">Fresh from the coast</span>
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
                <span className="text-muted-foreground">Creamy & cool</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Potato Salad</span>
                <span className="text-muted-foreground">Classic comfort</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Sweet Peas w/ Corn</span>
                <span className="text-muted-foreground">Garden fresh</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Green Beans w/ Potatoes</span>
                <span className="text-muted-foreground">Traditional recipe</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Yams</span>
                <span className="text-muted-foreground">Sweet & savory</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">White Rice</span>
                <span className="text-muted-foreground">Fluffy perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Yellow Rice</span>
                <span className="text-muted-foreground">Seasoned delight</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Dirty Rice</span>
                <span className="text-muted-foreground">Louisiana style</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Rice w/ Peas</span>
                <span className="text-muted-foreground">Caribbean inspired</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Rice w/ Gravy</span>
                <span className="text-muted-foreground">Comfort classic</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Macaroni & Cheese</span>
                <span className="text-muted-foreground">Creamy favorite</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cabbage</span>
                <span className="text-muted-foreground">Southern style</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Garden Salad</span>
                <span className="text-muted-foreground">Fresh & crisp</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Caesar Salad</span>
                <span className="text-muted-foreground">Classic favorite</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked Beans</span>
                <span className="text-muted-foreground">Sweet & tangy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mashed Potatoes & Gravy</span>
                <span className="text-muted-foreground">Smooth comfort</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Corn</span>
                <span className="text-muted-foreground">Sweet kernels</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetable Medley</span>
                <span className="text-muted-foreground">Colorful mix</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appetizers */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-elegant text-center">Appetizers</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Fruit Platter</span>
                <span className="text-muted-foreground">Seasonal fresh</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cheese Platter</span>
                <span className="text-muted-foreground">Artisan selection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meat Platter</span>
                <span className="text-muted-foreground">Premium cuts</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Charcuterie Board</span>
                <span className="text-muted-foreground">Gourmet selection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tuna Salad</span>
                <span className="text-muted-foreground">Light & fresh</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Grazing Table</span>
                <span className="text-muted-foreground">Abundant variety</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chocolate Covered Fruit</span>
                <span className="text-muted-foreground">Sweet indulgence</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Sliders</span>
                <span className="text-muted-foreground">Mini perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Pulled Pork Sliders</span>
                <span className="text-muted-foreground">Savory bites</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Meatballs</span>
                <span className="text-muted-foreground">Tender & flavorful</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Deviled Eggs</span>
                <span className="text-muted-foreground">Classic favorite</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chicken Salad</span>
                <span className="text-muted-foreground">Homestyle recipe</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetable Platter</span>
                <span className="text-muted-foreground">Fresh & colorful</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mini Chicken & Waffles</span>
                <span className="text-muted-foreground">Southern fusion</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tomato Caprese</span>
                <span className="text-muted-foreground">Italian classic</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Mini Loaded Potatoes</span>
                <span className="text-muted-foreground">Comfort bites</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Tomato Bruschetta</span>
                <span className="text-muted-foreground">Fresh & herby</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Shrimp Deviled Eggs</span>
                <span className="text-muted-foreground">Elegant twist</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Smoked Salmon Cucumber Bites</span>
                <span className="text-muted-foreground">Sophisticated starter</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vegetarian Options */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-elegant text-center">Vegetarian Options</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Patties w/ Gravy</span>
                <span className="text-muted-foreground">Plant-based comfort</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Burger</span>
                <span className="text-muted-foreground">Satisfying alternative</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Hot Dogs</span>
                <span className="text-muted-foreground">Classic style</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Lasagna</span>
                <span className="text-muted-foreground">Layered goodness</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Spaghetti</span>
                <span className="text-muted-foreground">Italian tradition</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Meat Loaf</span>
                <span className="text-muted-foreground">Hearty & wholesome</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desserts */}
        <Card className="shadow-card mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-elegant text-center">Desserts</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Brownies</span>
                <span className="text-muted-foreground">Rich & fudgy</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Red Velvet Cake</span>
                <span className="text-muted-foreground">Classic elegance</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vanilla Cake</span>
                <span className="text-muted-foreground">Timeless favorite</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Chocolate Cake</span>
                <span className="text-muted-foreground">Decadent delight</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Strawberry Cake</span>
                <span className="text-muted-foreground">Fresh & fruity</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Carrot Cake</span>
                <span className="text-muted-foreground">Moist & spiced</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cheesecake</span>
                <span className="text-muted-foreground">Creamy perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Cupcakes</span>
                <span className="text-muted-foreground">Individual treats</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Banana Pudding</span>
                <span className="text-muted-foreground">Southern comfort</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Dessert Shooters</span>
                <span className="text-muted-foreground">Sweet samplers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desserts */}
        <Card className="shadow-elegant mb-12">
          <CardHeader>
            <CardTitle className="text-3xl font-elegant text-center">Tanya's Sweet Creations</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Our talented Pastry Chef Tanya creates the perfect finishing touch for any celebration:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-foreground">
              <span>• Cupcakes</span>
              <span>• Dessert Shots</span>
              <span>• Custom Pastries</span>
              <span>• Special Occasion Cakes</span>
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