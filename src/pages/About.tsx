import { PageSection } from "@/components/ui/page-section";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CTASection } from "@/components/ui/cta-section";
import { ChefHat, Heart, Award, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";


import tanyaWardImg from "@/assets/tanya-ward.jpg";
import teamWesternGroup from "@/assets/gallery/team-western-group.jpg";

const About = () => {
  // Story section animations
  const { ref: storyContentRef, isVisible: storyContentVisible, variant: storyContentVariant } = useScrollAnimation({
    delay: 0,
    variant: "slide-right",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "slide-right", delay: 0 },
  });

  const { ref: storyImageRef, isVisible: storyImageVisible, variant: storyImageVariant } = useScrollAnimation({
    delay: 200,
    variant: "scale-fade",
    mobile: { variant: "fade-up", delay: 100 },
    desktop: { variant: "scale-fade", delay: 200 },
  });

  // Team cards animations
  const { ref: teamCard1Ref, isVisible: teamCard1Visible, variant: teamCard1Variant } = useScrollAnimation({
    delay: 100,
    variant: "bounce-in",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "bounce-in", delay: 100 },
  });

  const { ref: teamCard2Ref, isVisible: teamCard2Visible, variant: teamCard2Variant } = useScrollAnimation({
    delay: 250,
    variant: "bounce-in",
    mobile: { variant: "fade-up", delay: 100 },
    desktop: { variant: "bounce-in", delay: 250 },
  });

  // Values cards animations
  const { ref: value1Ref, isVisible: value1Visible, variant: value1Variant } = useScrollAnimation({
    delay: 100,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "fade-up", delay: 100 },
  });

  const { ref: value2Ref, isVisible: value2Visible, variant: value2Variant } = useScrollAnimation({
    delay: 220,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 80 },
    desktop: { variant: "fade-up", delay: 220 },
  });

  const { ref: value3Ref, isVisible: value3Visible, variant: value3Variant } = useScrollAnimation({
    delay: 340,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 160 },
    desktop: { variant: "fade-up", delay: 340 },
  });


  return (
    <div className="min-h-screen bg-gradient-hero">
      <main id="main-content">
        {/* Trust Marquee - First element after nav */}
        <TrustMarquee />
        
        {/* Header Section - With Team Group Background Image */}
        <section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
          {/* Background image - now using team western group */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${teamWesternGroup})` }}
            aria-hidden="true"
          />
          
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-background/85" />
          
          {/* Top gradient fade */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
          
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
          
          <div className="relative z-20">
            <PageHeader
              badge={{
                icon: <Heart className="h-5 w-5" />,
                text: "Our Story"
              }}
              title="Meet the Heart Behind Soul Train's Eatery"
              subtitle="A Family Legacy of Flavor"
              description="From family traditions to professional excellence, discover the passionate team that brings authentic Southern flavors and warm hospitality to every event across Charleston's beautiful Lowcountry."
              buttons={[
                { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }
              ]}
              animated={true}
            />
          </div>
        </section>

        {/* Our Story Section - Full-width Background Image */}
        <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
          {/* Full-width Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('/lovable-uploads/9ea8f6b7-e1cd-4f55-a434-1ffedf0b96dc.png')`
            }}
            aria-hidden="true"
          />
          
          {/* Dark gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          {/* Top gradient fade for smooth section transition */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/80 to-transparent z-10" />
          
          {/* Bottom gradient fade for smooth section transition */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/80 to-transparent z-10" />
          

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div 
                ref={storyContentRef}
                className={useAnimationClass(storyContentVariant, storyContentVisible)}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-white mb-6">
                  Our Story
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 leading-relaxed">
                  Soul Train's Eatery was born from a deep love of Southern cooking and a commitment to bringing families together around exceptional food. Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, our family-run business has been serving Charleston's Lowcountry for over two decades.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-8 leading-relaxed">
                  What started as a passion for creating memorable meals has grown into a trusted name in catering, known for our authentic flavors, professional service, and genuine Southern hospitality.
                </p>
                <Button asChild variant="cta" size="lg" className="shadow-lg">
                  <Link to="/gallery">
                    See Our Work
                  </Link>
                </Button>
              </div>
              
              <div 
                ref={storyImageRef}
                className={`overflow-hidden p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 ${useAnimationClass(storyImageVariant, storyImageVisible)}`}
              >
                <OptimizedImage 
                  src="/lovable-uploads/2bb3a6cf-e13c-4405-9b69-2cf610ae8411.png" 
                  alt="Chef Train and team at a formal military catering event" 
                  aspectRatio="aspect-video"
                  className="rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Pattern C */}
        <PageSection pattern="c" withBorder className="relative">
          
          <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">
                Meet Our Team
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Behind every memorable meal is a dedicated team of culinary professionals who share a passion for excellence and Southern hospitality.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
              <div ref={teamCard1Ref} className={useAnimationClass(teamCard1Variant, teamCard1Visible)}>
                <NeumorphicCard level={4} className="text-center hover:scale-105 transition-transform duration-300">
                  <div className="mb-6">
                    <OptimizedImage 
                      src="/lovable-uploads/ca9f1bb5-3b58-46fc-a5e4-cf2359a610ed.png" 
                      alt="Chef Dominick 'Train' Ward"
                      aspectRatio="aspect-square"
                      containerClassName="w-64 h-64 mx-auto mb-4 rounded-full"
                      className="rounded-full object-cover"
                    />
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
              </div>
              
              <div ref={teamCard2Ref} className={useAnimationClass(teamCard2Variant, teamCard2Visible)}>
                <NeumorphicCard level={4} className="text-center hover:scale-105 transition-transform duration-300">
                  <div className="mb-6">
                    <OptimizedImage 
                      src={tanyaWardImg} 
                      alt="Pastry Chef Tanya Ward" 
                      aspectRatio="aspect-square"
                      containerClassName="w-64 h-64 mx-auto mb-4 rounded-full"
                      className="rounded-full object-cover"
                    />
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
          </div>
        </PageSection>

        {/* Values Section - Full-width Background Image */}
        <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
          {/* Full-width Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('/lovable-uploads/eb77404f-369f-484f-a9ce-786b7f1ddc94.png')`
            }}
            aria-hidden="true"
          />
          
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Top gradient fade for smooth section transition */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/60 to-transparent z-10" />
          
          {/* Bottom gradient fade for smooth section transition */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/60 to-transparent z-10" />
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-white mb-6 drop-shadow-sm">
                Our Values
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl mx-auto drop-shadow-sm">
                These core values guide everything we do, from sourcing ingredients to serving your guests.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div 
                ref={value1Ref}
                className={`bg-black/35 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 ring-1 ring-white/10 hover:scale-105 transition-transform duration-300 ${useAnimationClass(value1Variant, value1Visible)}`}
              >
                <Award className="h-12 w-12 text-gold mx-auto mb-4 drop-shadow-sm" />
                <h3 className="text-xl font-elegant font-semibold text-white mb-4 drop-shadow-sm">Quality First</h3>
                <p className="text-sm text-white/80 drop-shadow-sm">
                  We source the finest ingredients and maintain the highest standards in food preparation and presentation.
                </p>
              </div>
              
              <div 
                ref={value2Ref}
                className={`bg-black/35 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 ring-1 ring-white/10 hover:scale-105 transition-transform duration-300 ${useAnimationClass(value2Variant, value2Visible)}`}
              >
                <Users className="h-12 w-12 text-ruby-light mx-auto mb-4 drop-shadow-sm" />
                <h3 className="text-xl font-elegant font-semibold text-white mb-4 drop-shadow-sm">Family Spirit</h3>
                <p className="text-sm text-white/80 drop-shadow-sm">
                  As a family-run business, we treat every client like family and every event like our own celebration.
                </p>
              </div>
              
              <div 
                ref={value3Ref}
                className={`bg-black/35 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 ring-1 ring-white/10 hover:scale-105 transition-transform duration-300 ${useAnimationClass(value3Variant, value3Visible)}`}
              >
                <Clock className="h-12 w-12 text-platinum-light mx-auto mb-4 drop-shadow-sm" />
                <h3 className="text-xl font-elegant font-semibold text-white mb-4 drop-shadow-sm">Reliability</h3>
                <p className="text-sm text-white/80 drop-shadow-sm">
                  Count on us to deliver exceptional service on time, every time, with the professionalism you deserve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Standard Crimson CTA Section */}
        <CTASection
          title="Ready to Experience Soul Train's Difference?"
          description="Let our family serve yours with the authentic flavors and warm hospitality that have made us Charleston's trusted catering choice."
          buttons={[
            { text: "Request Quote", href: "/request-quote#page-header", variant: "cta" },
            { text: "View Our Menu", href: "/menu", variant: "cta-white" }
          ]}
          footer="ServSafe certified · Family owned · Community trusted"
          showWatermark={true}
        />
      </main>
    </div>
  );
};

export default About;
