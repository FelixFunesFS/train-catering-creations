import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/lovable-uploads/c8da25d1-99cf-4dc7-84e8-aa6437f059c0.png"
          alt="Outdoor wedding ceremony with professional chef presenting signature dish"
          className="w-full h-full object-cover"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-center">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-elegant font-bold text-white mb-6">
            Soul Train's <span className="text-primary">Eatery</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl">
            Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/request-quote">
            <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-glow w-full sm:w-auto">
              Request a Quote
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-8 py-4 text-lg font-medium backdrop-blur-sm w-full sm:w-auto">
              View Our Work
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};