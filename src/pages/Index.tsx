import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star, Users, Crown, ChefHat, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-elegant font-bold text-foreground mb-6">
              Soul Train's <span className="text-primary">Eatery</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/request-quote">
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-glow">
                  Request a Quote
                </Button>
              </Link>
              <Link to="/gallery">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary-light px-8 py-4 text-lg font-medium">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
                8+ Years of Culinary Excellence
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event.
              </p>
              <Link to="/about">
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground">
                  Learn More About Us
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <ChefHat className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-elegant font-semibold text-foreground mb-2">Chef Train</h3>
                  <p className="text-sm text-muted-foreground">20+ Years Experience</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-elegant font-semibold text-foreground mb-2">Tanya Ward</h3>
                  <p className="text-sm text-muted-foreground">Pastry Chef</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-elegant font-semibold text-foreground mb-2">ServSafe</h3>
                  <p className="text-sm text-muted-foreground">Certified</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-elegant font-semibold text-foreground mb-2">Family Run</h3>
                  <p className="text-sm text-muted-foreground">Community Rooted</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
              Our Catering Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From elegant weddings to corporate events, we cater every occasion with care, flavor, and professionalism.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Weddings</h3>
                <p className="text-muted-foreground mb-4">Elegant receptions and intimate ceremonies with personalized menus</p>
                <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                  Learn More →
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
              <CardContent className="p-8">
                <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Black Tie Events</h3>
                <p className="text-muted-foreground mb-4">Sophisticated catering for galas and formal celebrations</p>
                <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                  Learn More →
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
              <CardContent className="p-8">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Military Functions</h3>
                <p className="text-muted-foreground mb-4">Honoring service with promotions, ceremonies, and celebrations</p>
                <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                  Learn More →
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Private Events</h3>
                <p className="text-muted-foreground mb-4">Corporate conferences, family gatherings, and special occasions</p>
                <Link to="/menu" className="text-primary hover:text-primary-glow font-medium">
                  View Menu →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
              Signature Dishes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Taste the South with our carefully crafted menu featuring both traditional favorites and creative specialties.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Southern Classics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Slow-Smoked Brisket</li>
                  <li>• Good Old-Fashioned Ribs</li>
                  <li>• Red Beans & Rice</li>
                  <li>• Southern-Style Cabbage</li>
                  <li>• Creamy Mac & Cheese</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Seafood & Specialties</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Shrimp Alfredo</li>
                  <li>• Baked Salmon</li>
                  <li>• Jamaican Jerk Chicken</li>
                  <li>• Customizable Taco Platters</li>
                  <li>• Vegetarian Options</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-3">Tanya's Desserts</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Custom Cupcakes</li>
                  <li>• Dessert Shots</li>
                  <li>• Pastry Creations</li>
                  <li>• Wedding Cakes</li>
                  <li>• Special Occasion Treats</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/menu">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-3">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-primary-foreground mb-8 opacity-90">
            Let Soul Train's Eatery handle the kitchen while you enjoy the moment. Contact us today for a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="tel:8439700265" 
              className="bg-white text-primary px-8 py-4 rounded-lg font-medium hover:bg-primary-light transition-colors text-lg"
            >
              Call (843) 970-0265
            </a>
            <Link to="/request-quote">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
                Get a Quote
              </Button>
            </Link>
          </div>
          <p className="text-primary-foreground mt-6 opacity-75">
            Proudly serving Charleston, SC and the surrounding Lowcountry
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;