import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { Heart, Star, Users, Crown } from "lucide-react";

export const ServicesSection = () => {
  return (
    <SectionCard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
            Our Catering Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From elegant weddings to corporate events, we cater every occasion with care, flavor, and professionalism.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Heart className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
              <p className="text-muted-foreground mb-6">Elegant receptions and intimate ceremonies with personalized menus</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Crown className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
              <p className="text-muted-foreground mb-6">Sophisticated catering for galas and formal celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Star className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-muted-foreground mb-6">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Users className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Private Events</h3>
              <p className="text-muted-foreground mb-6">Corporate conferences, family gatherings, and special occasions</p>
              <Link to="/menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                View Menu 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionCard>
  );
};