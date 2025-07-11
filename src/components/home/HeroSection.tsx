import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Text Content */}
      <div className="bg-gradient-hero flex items-center justify-center p-6 sm:p-8 lg:p-12 order-2 lg:order-1">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-elegant font-bold text-foreground mb-6">
            Soul Train's <span className="text-primary">Eatery</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
            Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/request-quote">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-glow w-full sm:w-auto">
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

      {/* Right Side - Image */}
      <div className="relative order-1 lg:order-2 min-h-[40vh] lg:min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="relative w-[85%] h-[80%] rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="/lovable-uploads/db45f284-96c9-4919-8f7c-474f1c62d822.png"
            alt="Soul Train's Eatery elegant buffet spread"
            className="w-full h-full object-contain transition-transform duration-700 hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 rounded-2xl"></div>
        </div>
      </div>
    </section>
  );
};