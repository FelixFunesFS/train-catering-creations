import { Card, CardContent } from "@/components/ui/card";

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
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a 
            href="/request-quote" 
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary-glow transition-colors shadow-glow"
          >
            Request Quote
          </a>
          <a 
            href="tel:8439700265" 
            className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors"
          >
            Call Us Today
          </a>
        </div>
      </CardContent>
    </Card>
  );
};