import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Image */}
      <div className="lg:w-1/2 h-64 lg:h-screen relative overflow-hidden">
        <img
          src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png"
          alt="Rustic wedding venue with chandeliers, string lights, and elegant dining setup"
          className="w-full h-full object-cover animate-fade-in"
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right Side - Content */}
      <div className="lg:w-1/2 bg-background flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="max-w-xl mx-auto lg:mx-0 animate-fade-in">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground mb-6 leading-tight">
              Soul Train's <span className="text-primary">Eatery</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/request-quote">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-elegant w-full sm:w-auto">
                Request a Quote
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="px-8 py-4 text-lg font-medium w-full sm:w-auto">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};