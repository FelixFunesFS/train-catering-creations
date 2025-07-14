
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-14">
          <Link to="/wedding-menu#page-header" className="block">
            <Card className="shadow-elegant hover:shadow-glow bg-gradient-card text-center transition-all duration-200 overflow-hidden group flex flex-col cursor-pointer">
              <div className="relative flex-1">
                <OptimizedImage
                  src="/lovable-uploads/546d7d1a-7987-4f44-a2d9-668efea60e51.png"
                  alt="Wedding Reception Setup"
                  aspectRatio="aspect-video"
                  className="group-hover:scale-105 transition-transform duration-300 h-full"
                />
              </div>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">Elegant receptions and intimate ceremonies with personalized menus</p>
                <span className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                  Learn More 
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/wedding-menu#page-header" className="block">
            <Card className="shadow-elegant hover:shadow-glow bg-gradient-card text-center transition-all duration-200 overflow-hidden group flex flex-col cursor-pointer">
              <div className="relative flex-1">
                <OptimizedImage
                  src="/lovable-uploads/63832488-46ff-4d71-ade5-f871173c28ab.png"
                  alt="Black Tie Event Catering"
                  aspectRatio="aspect-video"
                  className="group-hover:scale-105 transition-transform duration-300 h-full"
                />
              </div>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">Sophisticated catering for galas and formal celebrations</p>
                <span className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                  Learn More 
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-elegant hover:shadow-glow bg-gradient-card text-center transition-all duration-200 overflow-hidden group flex flex-col">
            <div className="relative flex-1">
              <OptimizedImage
                src="/lovable-uploads/3226c955-a9b7-4c8d-a4c2-e5e7fc206f6f.png"
                alt="Military Function Catering"
                aspectRatio="aspect-video"
                className="group-hover:scale-105 transition-transform duration-300 h-full"
              />
            </div>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu#page-header" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow bg-gradient-card text-center transition-all duration-200 overflow-hidden group flex flex-col">
            <div className="relative flex-1">
              <OptimizedImage
                src="/lovable-uploads/6cd766e3-21ce-4e88-a3a4-6c8835dc9654.png"
                alt="Private Event Catering"
                aspectRatio="aspect-video"
                className="group-hover:scale-105 transition-transform duration-300 h-full"
              />
            </div>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Private Events</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">Corporate conferences, family gatherings, and special occasions</p>
              <Link to="/menu#page-header" className="text-primary hover:text-primary-glow font-medium group inline-flex items-center gap-1">
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
