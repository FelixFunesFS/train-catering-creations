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

        {/* Menu Preview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Main Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Shrimp Alfredo</span>
                <span className="text-muted-foreground">Creamy perfection</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Baked Salmon</span>
                <span className="text-muted-foreground">Fresh & flavorful</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Slow-Smoked Brisket</span>
                <span className="text-muted-foreground">Fall-off-the-bone tender</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">BBQ Ribs</span>
                <span className="text-muted-foreground">Good old-fashioned</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Jamaican Jerk Chicken</span>
                <span className="text-muted-foreground">Spicy & authentic</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">Sides & More</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Red Beans & Rice</span>
                <span className="text-muted-foreground">Southern classic</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Southern-Style Cabbage</span>
                <span className="text-muted-foreground">Traditional recipe</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Creamy Mac & Cheese</span>
                <span className="text-muted-foreground">Smooth as silk</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Taco Platters</span>
                <span className="text-muted-foreground">Customizable</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-medium">Vegetarian Options</span>
                <span className="text-muted-foreground">Variety available</span>
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