import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero py-24 lg:py-40 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{
          backgroundImage: `url('/lovable-uploads/db45f284-96c9-4919-8f7c-474f1c62d822.png')`
        }}
      />
      {/* Dark Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/30" />
      {/* Hero Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-elegant font-bold text-foreground mb-8">
            Soul Train's <span className="text-primary">Eatery</span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <Link to="/request-quote">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-10 py-5 text-lg font-medium shadow-glow">
                Request a Quote
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary-light px-10 py-5 text-lg font-medium">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};