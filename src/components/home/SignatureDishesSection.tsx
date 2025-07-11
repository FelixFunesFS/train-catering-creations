import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SignatureDishesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-8">
            Signature Dishes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Taste the South with our carefully crafted menu featuring both traditional favorites and creative specialties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <Card className="shadow-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-6">Southern Classics</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Slow-Smoked Brisket</li>
                <li>• Good Old-Fashioned Ribs</li>
                <li>• Red Beans & Rice</li>
                <li>• Southern-Style Cabbage</li>
                <li>• Creamy Mac & Cheese</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-6">Seafood & Specialties</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Shrimp Alfredo</li>
                <li>• Baked Salmon</li>
                <li>• Jamaican Jerk Chicken</li>
                <li>• Customizable Taco Platters</li>
                <li>• Vegetarian Options</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-6">Tanya's Desserts</h3>
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

        <div className="text-center mt-16">
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