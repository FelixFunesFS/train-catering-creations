import { Card, CardContent } from "@/components/ui/card";

export const StatisticsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="shadow-card text-center">
            <CardContent className="p-8">
              <div className="text-5xl lg:text-6xl font-bold text-primary mb-2">750+</div>
              <p className="text-lg text-muted-foreground font-medium">Events Catered</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card text-center">
            <CardContent className="p-8">
              <div className="text-5xl lg:text-6xl font-bold text-primary mb-2">8,200+</div>
              <p className="text-lg text-muted-foreground font-medium">Meals Served</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card text-center">
            <CardContent className="p-8">
              <div className="text-5xl lg:text-6xl font-bold text-primary mb-2">8+</div>
              <p className="text-lg text-muted-foreground font-medium">Years Experience</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card text-center">
            <CardContent className="p-8">
              <div className="text-5xl lg:text-6xl font-bold text-primary mb-2">100%</div>
              <p className="text-lg text-muted-foreground font-medium">Satisfaction Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};