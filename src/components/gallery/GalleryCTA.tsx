import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GalleryCTA = () => {
  return (
    <section className="py-6 md:py-8 lg:py-10 bg-gradient-primary rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4 md:my-6 shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-6">
          Ready to Create Beautiful Memories?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-primary-foreground mb-8 lg:mb-12 opacity-90">
          Let us bring the same level of elegance and delicious food to your next event.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-xs sm:max-w-lg mx-auto">
          <Button asChild variant="cta" size="responsive-sm" className="w-full sm:w-auto">
            <a href="/request-quote">
              Request Quote
            </a>
          </Button>
          <Button asChild variant="cta-white" size="responsive-sm" className="w-full sm:w-auto">
            <a href="tel:8439700265">
              Call Us Today
            </a>
          </Button>
        </div>
        <p className="text-primary-foreground mt-6 lg:mt-8 opacity-75 text-sm sm:text-base">
          Proudly serving Charleston, SC and the surrounding Lowcountry
        </p>
      </div>
    </section>
  );
};