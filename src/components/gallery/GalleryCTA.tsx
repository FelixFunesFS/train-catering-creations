import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GalleryCTA = () => {
  return (
    <Card className="shadow-elegant bg-gradient-card">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
          Ready to Create Beautiful Memories?
        </h3>
        <p className="text-muted-foreground mb-6">
          Let us bring the same level of elegance and delicious food to your next event.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="bg-primary hover:bg-primary-glow text-primary-foreground px-6 py-3 text-base font-semibold shadow-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
            <a href="/request-quote">
              Request Quote
            </a>
          </Button>
          <Button asChild variant="outline" className="border-2 border-primary text-primary bg-transparent hover:bg-primary/5 hover:border-primary/50 px-6 py-3 text-base font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-md w-full sm:w-auto">
            <a href="tel:8439700265">
              Call Us Today
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};