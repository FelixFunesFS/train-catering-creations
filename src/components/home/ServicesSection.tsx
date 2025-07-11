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
          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow overflow-hidden group">
            <div className="relative h-32 overflow-hidden">
              <img 
                src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png" 
                alt="Rustic wedding venue with chandeliers" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
              <p className="text-muted-foreground mb-6">Elegant receptions and intimate ceremonies with personalized menus</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow overflow-hidden group">
            <div className="relative h-32 overflow-hidden">
              <img 
                src="/lovable-uploads/a68ac24e-cf0d-4941-9059-568c9b92bebf.png" 
                alt="Grand banquet hall with gold accents" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <Crown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
              <p className="text-muted-foreground mb-6">Sophisticated catering for galas and formal celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow overflow-hidden group">
            <div className="relative h-32 overflow-hidden">
              <img 
                src="/lovable-uploads/9ea8f6b7-e1cd-4f55-a434-1ffedf0b96dc.png" 
                alt="Military formal ceremony with decorative arch" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-muted-foreground mb-6">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium">
                Learn More →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-shadow overflow-hidden group">
            <div className="relative h-32 overflow-hidden">
              <img 
                src="/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png" 
                alt="Professional patriotic buffet setup" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
            </div>
            <CardContent className="p-8">
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