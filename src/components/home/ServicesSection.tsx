import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const ServicesSection = () => {
  return (
    <SectionCard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
            Our Catering Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            From elegant weddings to corporate events, we cater every occasion with care, flavor, and professionalism.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-36 mb-0 overflow-hidden">
              <OptimizedImage
                src="/lovable-uploads/546d7d1a-7987-4f44-a2d9-668efea60e51.png"
                alt="Wedding Reception Setup"
                className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none"></div>
            </div>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-2">Weddings</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Elegant receptions and intimate ceremonies with personalized menus</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-36 mb-0 overflow-hidden">
              <OptimizedImage
                src="/lovable-uploads/63832488-46ff-4d71-ade5-f871173c28ab.png"
                alt="Black Tie Event Catering"
                className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none"></div>
            </div>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-2">Black Tie Events</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Sophisticated catering for galas and formal celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-36 mb-0 overflow-hidden">
              <OptimizedImage
                src="/lovable-uploads/3226c955-a9b7-4c8d-a4c2-e5e7fc206f6f.png"
                alt="Military Function Catering"
                className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none"></div>
            </div>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-2">Military Functions</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-elegant transition-all duration-200 overflow-hidden group">
            <div className="relative h-36 mb-0 overflow-hidden">
              <OptimizedImage
                src="/lovable-uploads/6cd766e3-21ce-4e88-a3a4-6c8835dc9654.png"
                alt="Private Event Catering"
                className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none"></div>
            </div>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-2">Private Events</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Corporate conferences, family gatherings, and special occasions</p>
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