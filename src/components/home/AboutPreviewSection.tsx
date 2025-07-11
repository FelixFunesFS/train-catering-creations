import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";

export const AboutPreviewSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-8 hover:text-primary transition-colors duration-300">
              8+ Years of Culinary Excellence
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed transform hover:translate-x-2 transition-transform duration-300">
              Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
            </p>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed transform hover:translate-x-2 transition-transform duration-300 delay-100">
              From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event.
            </p>
            <Link to="/about">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 hover:scale-105 hover:shadow-elegant transform transition-all duration-300 hover:-translate-y-1">
                Learn More About Us
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in" style={{animationDelay: '200ms'}}>
              <CardContent className="p-8 text-center">
                <ChefHat className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">Chef Train</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">20+ Years Experience</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in" style={{animationDelay: '400ms'}}>
              <CardContent className="p-8 text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">Tanya Ward</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Pastry Chef</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in" style={{animationDelay: '600ms'}}>
              <CardContent className="p-8 text-center">
                <Award className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">ServSafe</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Certified</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in" style={{animationDelay: '800ms'}}>
              <CardContent className="p-8 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-all duration-300" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">Family Run</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Community Rooted</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};