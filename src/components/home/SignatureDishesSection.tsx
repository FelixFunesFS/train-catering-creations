import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SignatureDishesSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
            Signature Dishes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Taste the South with our carefully crafted menu featuring both traditional favorites and creative specialties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <Card className="shadow-card overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png" 
                alt="Perfectly sliced brisket showcase" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Southern Classics</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Slow-Smoked Brisket</li>
                <li>• Good Old-Fashioned Ribs</li>
                <li>• Red Beans & Rice</li>
                <li>• Southern-Style Cabbage</li>
                <li>• Creamy Mac & Cheese</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png" 
                alt="Gourmet salmon and creamy casserole presentation" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Seafood & Specialties</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Shrimp Alfredo</li>
                <li>• Baked Salmon</li>
                <li>• Jamaican Jerk Chicken</li>
                <li>• Customizable Taco Platters</li>
                <li>• Vegetarian Options</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png" 
                alt="Elegant layered dessert cups arrangement" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Tanya's Desserts</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Custom Cupcakes</li>
                <li>• Dessert Shots</li>
                <li>• Pastry Creations</li>
                <li>• Wedding Cakes</li>
                <li>• Special Occasion Treats</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <Link to="/menu">
            <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-10 py-4">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};