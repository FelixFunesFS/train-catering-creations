import { Link } from "react-router-dom";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { Heart, Users, ChefHat, Award } from "lucide-react";

export const SimplifiedAboutPreviewSection = () => {
  return (
    <section>
      <ResponsiveWrapper hasFullWidthCard>
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Culinary Excellence
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event. Taste the love in every bite.
            </p>
            <NeumorphicButton asChild variant="primary" size="lg">
              <Link to="/about#page-header">
                Learn More About Us
              </Link>
            </NeumorphicButton>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            <SectionContentCard 
              className="text-center"
              interactive
            >
              <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-2">Chef Train</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">20+ Years Experience</p>
            </SectionContentCard>
            
            <SectionContentCard 
              className="text-center"
              interactive
            >
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-2">Tanya Ward</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Pastry Chef</p>
            </SectionContentCard>
            
            <SectionContentCard 
              className="text-center"
              interactive
            >
              <Award className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-2">ServSafe</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Certified</p>
            </SectionContentCard>
            
            <SectionContentCard 
              className="text-center"
              interactive
            >
              <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-2">Family Run</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Community Rooted</p>
            </SectionContentCard>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};