
import { PageSection } from "@/components/ui/page-section";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CTASection } from "@/components/ui/cta-section";
import { ChefHat, Heart, Award, Users, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <main id="main-content">
        {/* Header Section - Pattern A */}
        <PageSection pattern="a" skipToContentId="about-header">
          <PageHeader
            title="Meet the Heart Behind Soul Train's Eatery"
            description="From family traditions to professional excellence, discover the passionate team that brings authentic Southern flavors and warm hospitality to every event across Charleston's beautiful Lowcountry."
            icons={[
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8" />,
              <Heart className="h-6 w-6 sm:h-8 sm:w-8" />,
              <Award className="h-6 w-6 sm:h-8 sm:w-8" />
            ]}
            buttons={[
              { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
            ]}
          />
        </PageSection>

        {/* Our Story Section - Pattern B */}
        <PageSection pattern="b" withBorder>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">
                  Our Story
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                  Soul Train's Eatery was born from a deep love of Southern cooking and a commitment to bringing families together around exceptional food. Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, our family-run business has been serving Charleston's Lowcountry for over two decades.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">
                  What started as a passion for creating memorable meals has grown into a trusted name in catering, known for our authentic flavors, professional service, and genuine Southern hospitality.
                </p>
                <Button asChild variant="cta" size="lg">
                  <Link to="/gallery">
                    See Our Work
                  </Link>
                </Button>
              </div>
              
              <NeumorphicCard level={3} className="overflow-hidden p-3">
                <OptimizedImage 
                  src="/lovable-uploads/2bb3a6cf-e13c-4405-9b69-2cf610ae8411.png" 
                  alt="Chef Train and team at a formal military catering event" 
                  aspectRatio="aspect-video"
                  className="rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </NeumorphicCard>
            </div>
          </div>
        </PageSection>

        {/* Team Section - Pattern C */}
        <PageSection pattern="c" withBorder>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">
                Meet Our Team
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Behind every memorable meal is a dedicated team of culinary professionals who share a passion for excellence and Southern hospitality.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
              <NeumorphicCard level={4} className="text-center hover:scale-105 transition-transform duration-300">
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <OptimizedImage 
                      src="/lovable-uploads/ca9f1bb5-3b58-46fc-a5e4-cf2359a610ed.png" 
                      alt="Chef Dominick 'Train' Ward"
                      aspectRatio="aspect-square"
                      className="rounded-full object-cover"
                    />
                  </div>
                  <ChefHat className="h-12 w-12 text-primary mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-2">
                  Chef Dominick "Train" Ward
                </h3>
                <p className="text-primary font-medium mb-4">Head Chef & Co-Founder</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  With over 20 years of culinary experience, Chef Train brings authentic Southern flavors and professional excellence to every event. His passion for food and commitment to quality has made Soul Train's Eatery a trusted name in Charleston catering.
                </p>
              </NeumorphicCard>
              
              <NeumorphicCard level={4} className="text-center hover:scale-105 transition-transform duration-300">
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <OptimizedImage 
                      src="/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png" 
                      alt="Pastry Chef Tanya Ward" 
                      aspectRatio="aspect-square"
                      className="rounded-full object-cover"
                    />
                  </div>
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-2">
                  Tanya Ward
                </h3>
                <p className="text-primary font-medium mb-4">Pastry Chef & Co-Founder</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tanya's expertise in pastry arts and dessert creation adds the perfect sweet touch to every celebration. Her attention to detail and creative flair ensure that every dessert is both beautiful and delicious.
                </p>
              </NeumorphicCard>
            </div>
          </div>
        </PageSection>

        {/* Values Section - Pattern B */}
        <PageSection pattern="b" withBorder>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">
                Our Values
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                These core values guide everything we do, from sourcing ingredients to serving your guests.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <NeumorphicCard level={2} className="text-center hover:scale-105 transition-transform duration-300">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  We source the finest ingredients and maintain the highest standards in food preparation and presentation.
                </p>
              </NeumorphicCard>
              
              <NeumorphicCard level={2} className="text-center hover:scale-105 transition-transform duration-300">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Family Spirit</h3>
                <p className="text-sm text-muted-foreground">
                  As a family-run business, we treat every client like family and every event like our own celebration.
                </p>
              </NeumorphicCard>
              
              <NeumorphicCard level={2} className="text-center hover:scale-105 transition-transform duration-300">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Reliability</h3>
                <p className="text-sm text-muted-foreground">
                  Count on us to deliver exceptional service on time, every time, with the professionalism you deserve.
                </p>
              </NeumorphicCard>
            </div>
          </div>
        </PageSection>

        {/* CTA Section - Pattern A */}
        <PageSection pattern="a" withBorder>
          <CTASection
            title="Ready to Experience Soul Train's Difference?"
            description="Let our family serve yours with the authentic flavors and warm hospitality that have made us Charleston's trusted catering choice for over two decades."
            buttons={[
              {
                text: "Request Quote",
                href: "/request-quote#page-header",
                variant: "cta"
              },
              {
                text: "View Our Menu",
                href: "/menu",
                variant: "cta-white"
              }
            ]}
            footer="ServSafe certified • Family owned • Community trusted"
          />
        </PageSection>
      </main>
    </div>
  );
};

export default About;
