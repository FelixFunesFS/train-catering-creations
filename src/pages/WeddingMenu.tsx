import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Crown } from "lucide-react";

const WeddingMenu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <Crown className="h-8 w-8 text-primary mx-2" />
            <Star className="h-8 w-8 text-primary ml-2" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
            Wedding & Black Tie Events
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Elevate your special occasion with our elegant catering service. From intimate ceremonies to grand celebrations, we create unforgettable culinary experiences.
          </p>
        </div>

        {/* Notice */}
        <div className="text-center mb-12">
          <Card className="bg-primary-light border-primary shadow-glow">
            <CardContent className="p-8">
              <h3 className="text-xl font-elegant font-semibold text-primary mb-4">
                Exclusive Wedding & Event Menus Coming Soon
              </h3>
              <p className="text-primary-foreground">
                Our specialized wedding and black tie event menus will be available shortly. Contact us to discuss your vision and receive a personalized proposal for your special day.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Types */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-card text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-elegant">Weddings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                From intimate ceremonies to grand receptions, we make your wedding day perfectly delicious.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center">
            <CardHeader>
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-elegant">Black Tie Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sophisticated menus for galas, corporate events, and formal celebrations.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center">
            <CardHeader>
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-elegant">Military Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Proudly serving military promotions, ceremonies, and special occasions with honor.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant">Premium Service Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Elegant presentation and professional service staff</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Custom menu design for dietary restrictions</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Full-service setup and cleanup</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>ServSafe certified food handling</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Coordination with your event planner</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant">Specialty Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Cocktail hour hors d'oeuvres and canapés</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Multi-course plated dinners</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Elegant buffet presentations</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Tanya's custom wedding desserts</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Late-night snack stations</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="shadow-elegant bg-gradient-card">
          <CardContent className="p-8 lg:p-12 text-center">
            <h3 className="text-3xl font-elegant font-bold text-foreground mb-6">
              Let's Plan Your Perfect Event
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Schedule a consultation to discuss your vision, taste our specialties, and receive a customized proposal for your special occasion.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <a 
                href="tel:8439700265" 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary-glow transition-colors shadow-glow"
              >
                Call (843) 970-0265
              </a>
              <a 
                href="mailto:soultrainseatery@gmail.com" 
                className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors"
              >
                Email for Quote
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Serving Charleston, SC and surrounding Lowcountry areas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeddingMenu;