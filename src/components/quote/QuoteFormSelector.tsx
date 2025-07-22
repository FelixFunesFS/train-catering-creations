
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Utensils, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const QuoteFormSelector = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-elegant text-foreground mb-4">Choose Your Event Type</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the option that best matches your event so we can provide you with the most accurate quote and service recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regular Events Card */}
        <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background via-primary/5 to-accent/10 border-2 border-primary/30 hover:border-primary/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-elegant text-foreground mb-3">Regular Events</h3>
              <p className="text-muted-foreground">
                Perfect for corporate events, birthday parties, baby showers, and casual gatherings
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Corporate Events & Private Parties</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Birthday & Baby Shower Celebrations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Bereavement & Family Gatherings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Holiday Parties & Graduations</span>
              </div>
            </div>

            <Button asChild variant="cta" size="responsive-lg" className="w-full">
              <Link to="/request-quote/regular">
                Get Regular Event Quote
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Wedding & Black Tie Events Card */}
        <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background via-accent/5 to-primary/10 border-2 border-accent/30 hover:border-accent/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-accent/20 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 mb-4 group-hover:bg-accent/20 transition-colors">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-elegant text-foreground mb-3">Wedding & Black Tie Events</h3>
              <p className="text-muted-foreground">
                Elegant catering for weddings, galas, military functions, and formal celebrations
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Weddings & Anniversary Celebrations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Black Tie Events & Galas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Military Functions & Ceremonies</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Engagement Parties & Formal Events</span>
              </div>
            </div>

            <Button asChild variant="cta" size="responsive-lg" className="w-full">
              <Link to="/request-quote/wedding">
                Get Wedding Quote
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <Card className="shadow-card bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Not sure which option to choose?</span>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              No worries! You can always call us directly for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="cta-white" size="responsive-sm">
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
      </div>
    </div>
  );
};

export default QuoteFormSelector;
