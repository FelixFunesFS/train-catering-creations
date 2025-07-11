import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Users, Crown } from "lucide-react";

export const ServicesSection = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-8">
            Our Catering Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From elegant weddings to corporate events, we cater every occasion with care, flavor, and professionalism.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
            <CardContent className="p-10">
              <Heart className="h-14 w-14 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
              <p className="text-muted-foreground mb-6">Elegant receptions and intimate ceremonies with personalized menus</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
            <CardContent className="p-10">
              <Crown className="h-14 w-14 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
              <p className="text-muted-foreground mb-6">Sophisticated catering for galas and formal celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
            <CardContent className="p-10">
              <Star className="h-14 w-14 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-muted-foreground mb-6">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow">
            <CardContent className="p-10">
              <Users className="h-14 w-14 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Private Events</h3>
              <p className="text-muted-foreground mb-6">Corporate conferences, family gatherings, and special occasions</p>
              <Link to="/menu" className="text-primary hover:text-primary-glow font-medium">
                View Menu →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};