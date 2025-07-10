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
        <div className="mb-12">
          <Accordion type="multiple" defaultValue={["proteins", "sides"]} className="w-full">
            {/* Proteins */}
            <AccordionItem value="proteins" className="border rounded-lg mb-4 shadow-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <h3 className="text-2xl font-elegant font-bold text-foreground">Proteins</h3>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <span>Baked/Smoked Chicken</span>
                  <span>Barbecue Chicken</span>
                  <span>Chicken Tenders</span>
                  <span>Turkey Wings</span>
                  <span>Chicken Alfredo</span>
                  <span>Meatloaf</span>
                  <span>Brisket</span>
                  <span>Hamburgers</span>
                  <span>Smoked Sausage</span>
                  <span>Fried Pork Chops</span>
                  <span>Smothered Pork Chops</span>
                  <span>Pulled Pork</span>
                  <span>Ribs</span>
                  <span>Low Country Boil</span>
                  <span>Fried Chicken</span>
                  <span>Fried Fish</span>
                  <span>Baked Salmon</span>
                  <span>Shrimp Alfredo</span>
                  <span>Spaghetti</span>
                  <span>Lasagna</span>
                  <span>Tacos</span>
                  <span>Chicken Wings</span>
                  <span>Crabs</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sides */}
            <AccordionItem value="sides" className="border rounded-lg mb-4 shadow-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <h3 className="text-2xl font-elegant font-bold text-foreground">Sides</h3>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <span>Macaroni Salad</span>
                  <span>Potato Salad</span>
                  <span>Sweet Peas w/ Corn</span>
                  <span>Green Beans w/ Potatoes</span>
                  <span>Yams</span>
                  <span>White Rice</span>
                  <span>Yellow Rice</span>
                  <span>Dirty Rice</span>
                  <span>Rice w/ Peas</span>
                  <span>Rice w/ Gravy</span>
                  <span>Macaroni & Cheese</span>
                  <span>Cabbage</span>
                  <span>Garden Salad</span>
                  <span>Caesar Salad</span>
                  <span>Baked Beans</span>
                  <span>Mashed Potatoes & Gravy</span>
                  <span>Corn</span>
                  <span>Vegetable Medley</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appetizers */}
            <AccordionItem value="appetizers" className="border rounded-lg mb-4 shadow-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <h3 className="text-2xl font-elegant font-bold text-foreground">Appetizers</h3>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <span>Fruit Platter</span>
                  <span>Cheese Platter</span>
                  <span>Meat Platter</span>
                  <span>Charcuterie Board</span>
                  <span>Tuna Salad</span>
                  <span>Grazing Table</span>
                  <span>Chocolate Covered Fruit Platter</span>
                  <span>Chicken Sliders</span>
                  <span>Pulled Pork Sliders</span>
                  <span>Meatballs</span>
                  <span>Deviled Eggs</span>
                  <span>Chicken Salad</span>
                  <span>Vegetable Platter</span>
                  <span>Mini Chicken & Waffles</span>
                  <span>Tomato Caprese</span>
                  <span>Mini Loaded Potatoes</span>
                  <span>Tomato Bruschetta</span>
                  <span>Shrimp Deviled Eggs w/Bacon Finish</span>
                  <span>Smoked Salmon Cucumber Bites</span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Vegetarian Options */}
            <AccordionItem value="vegetarian" className="border rounded-lg mb-4 shadow-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <h3 className="text-2xl font-elegant font-bold text-foreground">Vegetarian Options</h3>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <span>Patties w/ Gravy</span>
                  <span>Burger</span>
                  <span>Hot Dogs</span>
                  <span>Lasagna</span>
                  <span>Spaghetti</span>
                  <span>Meat Loaf</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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