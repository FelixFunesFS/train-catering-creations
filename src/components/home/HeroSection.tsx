import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
      {/* Title at Top */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-6xl xl:text-7xl font-elegant font-bold text-foreground">
          Soul Train's <span className="text-primary">Eatery</span>
        </h1>
      </div>

      {/* Image with Overlaid Buttons */}
      <div className="relative w-full max-w-4xl mb-8">
        <div className="relative w-full h-[50vh] lg:h-[60vh] rounded-lg overflow-hidden shadow-elegant">
          <img
            src="/lovable-uploads/db45f284-96c9-4919-8f7c-474f1c62d822.png"
            alt="Soul Train's Eatery elegant buffet spread"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-lg"></div>
          
          {/* Overlaid Buttons */}
          <div className="absolute inset-0 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6">
            <Link to="/request-quote">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-glow backdrop-blur-sm w-full sm:w-auto">
                Request a Quote
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="bg-background/90 hover:bg-background text-foreground border-border px-8 py-4 text-lg font-medium backdrop-blur-sm w-full sm:w-auto">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Subtitle at Bottom */}
      <div className="text-center max-w-2xl">
        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
          Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
        </p>
      </div>
    </section>
  );
};