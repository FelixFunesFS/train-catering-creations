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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-md mx-auto">
          <Button asChild variant="cta" size="responsive-sm">
            <a href="/request-quote">
              Request Quote
            </a>
          </Button>
          <Button asChild variant="cta-outline" size="responsive-sm">
            <a href="tel:8439700265">
              Call Us Today
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};