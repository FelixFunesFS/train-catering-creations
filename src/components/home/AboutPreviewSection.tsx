import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";

export const AboutPreviewSection = () => {
  return (
    <SectionCard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
              8+ Years of Culinary Excellence
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event.
            </p>
            <Link to="/about">
              <Button variant="cta" size="responsive-lg">
                Learn More About Us
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:gap-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group">
            <CardContent className="p-6 text-center">
              <ChefHat className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2">Chef Train</h3>
              <p className="text-sm text-muted-foreground">20+ Years Experience</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group">
            <CardContent className="p-6 text-center">
              <Heart className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2">Tanya Ward</h3>
              <p className="text-sm text-muted-foreground">Pastry Chef</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group">
            <CardContent className="p-6 text-center">
              <Award className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2">ServSafe</h3>
              <p className="text-sm text-muted-foreground">Certified</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2">Family Run</h3>
              <p className="text-sm text-muted-foreground">Community Rooted</p>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};