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
          <Card className="overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img 
                src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png" 
                alt="Perfectly sliced brisket showcase" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all duration-300" />
            </div>
            <CardContent className="p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-b-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">Southern Classics</h3>
                <ul className="space-y-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <li className="hover:translate-x-2 transition-transform duration-200">• Slow-Smoked Brisket</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-75">• Good Old-Fashioned Ribs</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-150">• Red Beans & Rice</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-225">• Southern-Style Cabbage</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-300">• Creamy Mac & Cheese</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{animationDelay: '400ms'}}>
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img 
                src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png" 
                alt="Gourmet salmon and creamy casserole presentation" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all duration-300" />
            </div>
            <CardContent className="p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-b-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">Seafood & Specialties</h3>
                <ul className="space-y-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <li className="hover:translate-x-2 transition-transform duration-200">• Shrimp Alfredo</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-75">• Baked Salmon</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-150">• Jamaican Jerk Chicken</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-225">• Customizable Taco Platters</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-300">• Vegetarian Options</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{animationDelay: '600ms'}}>
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img 
                src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png" 
                alt="Elegant layered dessert cups arrangement" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all duration-300" />
            </div>
            <CardContent className="p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-b-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">Tanya's Desserts</h3>
                <ul className="space-y-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <li className="hover:translate-x-2 transition-transform duration-200">• Custom Cupcakes</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-75">• Dessert Shots</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-150">• Pastry Creations</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-225">• Wedding Cakes</li>
                  <li className="hover:translate-x-2 transition-transform duration-200 delay-300">• Special Occasion Treats</li>
                </ul>
              </div>
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