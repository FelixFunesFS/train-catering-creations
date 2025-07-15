import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";
import { AnimatedSection, AnimatedGrid } from "@/components/ui/animated-section";

export const AboutPreviewSection = () => {
  return (
    <SectionCard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection animation="fade-in-left" delay={0}>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
                8+ Years of Culinary Excellence
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">
                From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event.
              </p>
              <Link to="/about#page-header">
                <Button variant="cta" size="responsive-md" className="w-3/5 sm:w-auto sm:min-w-[14rem] hover-lift">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedGrid 
            className="grid-cols-2 gap-6 md:gap-10 lg:gap-12"
            staggerDelay={100}
          >
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Chef Train</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">20+ Years Experience</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Tanya Ward</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Pastry Chef</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">ServSafe</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Certified</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-200 overflow-hidden group hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 hover-bounce" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Family Run</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Community Rooted</p>
            </CardContent>
          </Card>
          </AnimatedGrid>
        </div>
      </div>
    </SectionCard>
  );
};