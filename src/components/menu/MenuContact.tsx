import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MenuContact = () => {
  return (
    <Card className="shadow-elegant bg-gradient-card">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
          Custom Menu Planning
        </h3>
        <p className="text-muted-foreground mb-6">
          Every event is unique. Let us create a customized menu that perfectly fits your occasion, dietary needs, and budget.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Button asChild variant="cta-outline" size="responsive-sm">
            <a href="tel:8439700265">
              Call (843) 970-0265
            </a>
          </Button>
          <Button asChild variant="outline" size="responsive-sm">
            <a href="mailto:soultrainseatery@gmail.com">
              Email Us
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuContact;