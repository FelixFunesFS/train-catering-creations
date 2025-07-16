import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Crown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SectionCard } from "@/components/ui/section-card";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { WeddingMenuCard } from "@/components/WeddingMenuCard";

const WeddingMenu = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });

  const { ref: eventCardsRef, isVisible: eventCardsVisible, variant: eventCardsVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 200,
    mobile: { delay: 150 },
    desktop: { delay: 250 }
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const eventCardsAnimationClass = useAnimationClass(eventCardsVariant, eventCardsVisible);

  return (
    <div className="min-h-screen bg-gradient-hero">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={headerRef} className={headerAnimationClass}>
              <PageHeader
              title="Elegant Events with Southern Soul"
              description="Your special day deserves exceptional flavor and flawless presentation. At Soul Train's Eatery, we specialize in catering weddings and upscale black-tie events with grace, style, and warmth. From cocktail hour hors d'oeuvres to grand receptions, our team blends culinary excellence with genuine hospitality—making your celebration both sophisticated and soulful."
              icons={[
                <Heart className="h-6 w-6 sm:h-8 sm:w-8" />,
                <Crown className="h-6 w-6 sm:h-8 sm:w-8" />,
                <Star className="h-6 w-6 sm:h-8 sm:w-8" />
              ]}
              buttons={[{ text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }]}
            />
            </div>
            
            <div ref={eventCardsRef} className={`grid md:grid-cols-3 gap-6 lg:gap-8 mt-12 ${eventCardsAnimationClass}`}>
          <Card className="shadow-elegant hover:shadow-glow bg-gradient-card overflow-hidden group transition-all duration-200">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/269bd0e4-4a19-4f14-b966-7b3173a10b95.png" 
                alt="Elegant wedding reception setup with beautiful floral arrangements and draped tables"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-elegant font-semibold text-white mb-2">Weddings</h3>
              </div>
            </div>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow bg-gradient-card overflow-hidden group transition-all duration-200">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/d4bf7685-b46c-4c39-8a28-1d003b978403.png" 
                alt="Elegant outdoor catering setup with chafing dishes and floral decorations"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-elegant font-semibold text-white mb-2">Black Tie Events</h3>
              </div>
            </div>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow bg-gradient-card overflow-hidden group transition-all duration-200">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/cf6d0cd4-02bd-4607-b658-14a809d30275.png" 
                alt="Military honor guard ceremony with elegant charcuterie board catering"
                className="w-full h-full object-cover object-[50%_35%] transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-elegant font-semibold text-white mb-2">Military Functions</h3>
              </div>
            </div>
          </Card>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12 lg:space-y-16">
              {/* Hors d'Oeuvres & Small Bites */}
              <section>
                {(() => {
                  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
                    variant: 'ios-spring', 
                    delay: 0,
                    mobile: { delay: 0 },
                    desktop: { delay: 100 }
                  });
                  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
                  
                  return (
                    <div ref={headerRef} className={`text-center mb-8 lg:mb-12 ${headerAnimationClass}`}>
                      <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                        Hors d'Oeuvres & Small Bites
                      </h2>
                      <p className="text-lg text-muted-foreground italic">
                        Artfully crafted starters to elevate cocktail hours and refined gatherings
                      </p>
                    </div>
                  );
                })()}
                
                <div className="grid md:grid-cols-2 gap-6">
              {(() => {
                const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
                  variant: 'elastic', 
                  delay: 200,
                  mobile: { delay: 150 },
                  desktop: { delay: 250 }
                });
                const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
                
                return (
                  <Card ref={cardRef} className={`shadow-elegant hover:shadow-glow bg-gradient-card ${cardAnimationClass}`}>
                    <CardContent className="p-6">
                      <h4 className="font-elegant font-semibold text-foreground mb-2">Fresh Local Fruit Platter</h4>
                      <p className="text-sm text-muted-foreground">An elegant arrangement of the season's finest locally sourced fruits, artfully displayed for visual and flavorful delight.</p>
                    </CardContent>
                  </Card>
                );
              })()}
              
              <WeddingMenuCard 
                title="Exquisite Cheese Platter" 
                description="A curated selection of gourmet cheeses, served with artisan crackers and refined accompaniments."
                delay={300}
              />
              
              <WeddingMenuCard 
                title="Signature Charcuterie Board" 
                description="A luxurious array of cured meats, cheeses, fruits, nuts, and artisanal bites, perfect for sophisticated mingling."
                delay={400}
              />
              
              <WeddingMenuCard 
                title="Grazing Table" 
                description="An abundant and visually stunning spread of sweet and savory offerings, ideal for sharing and conversation."
                delay={500}
              />
              
              <WeddingMenuCard 
                title="Chocolate-Covered Fruit" 
                description="Hand-dipped seasonal fruits—strawberries, pineapples, and more—enrobed in premium chocolate for a decadent finish."
                delay={600}
              />
              
              <WeddingMenuCard 
                title="Slow-Smoked Chicken Sliders" 
                description="Tender smoked chicken nestled in soft rolls, topped with house-made slaw and our signature sauce."
                delay={700}
              />
              
              <WeddingMenuCard 
                title="Slow-Smoked Pork Sliders" 
                description="Savory pulled pork slow-cooked to perfection, served on brioche with tangy pickles and house BBQ sauce."
                delay={800}
              />
              
              <WeddingMenuCard 
                title="Italian-Style Meatballs" 
                description="Succulent beef meatballs simmered in a rich marinara, finished with shaved parmesan and garden herbs."
                delay={900}
              />
              
              <WeddingMenuCard 
                title="Velvety Deviled Eggs" 
                description="A Southern classic with a refined touch—smooth, creamy filling with a delicate hint of spice."
                delay={1000}
              />
              
              <WeddingMenuCard 
                title="Mini Chicken & Waffles" 
                description="A playful upscale twist on a Southern favorite—crispy chicken atop savory waffles, finished with a maple butter glaze."
                delay={1100}
              />
              
              <WeddingMenuCard 
                title="Tomato Caprese Skewers" 
                description="Cherry tomatoes, fresh mozzarella, and basil leaves, delicately drizzled with aged balsamic reduction."
                delay={1200}
              />
              
              <WeddingMenuCard 
                title="Petite Loaded Potato Bites" 
                description="Baby potatoes filled with artisan cheese, sour cream, and fresh chives—comfort in a bite."
                delay={1300}
              />
              
              <WeddingMenuCard 
                title="Heirloom Tomato Bruschetta" 
                description="Crisp crostini topped with a medley of heirloom tomatoes, garlic, and fresh basil."
                delay={1400}
              />
              
              <WeddingMenuCard 
                title="Smoked Salmon Cucumber Rounds" 
                description="Delicate smoked salmon served on crisp cucumber slices, finished with dill-infused cream cheese."
                delay={1500}
              />
                </div>
              </section>

              {/* Signature Entrées */}
              <section>
                {(() => {
                  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
                    variant: 'ios-spring', 
                    delay: 0,
                    mobile: { delay: 0 },
                    desktop: { delay: 100 }
                  });
                  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
                  
                  return (
                    <div ref={headerRef} className={`text-center mb-8 lg:mb-12 ${headerAnimationClass}`}>
                      <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                        Signature Entrées
                      </h2>
                      <p className="text-lg text-muted-foreground italic">
                        Premium proteins, thoughtfully prepared for elegant affairs
                      </p>
                    </div>
                  );
                })()}
                
                <div className="grid md:grid-cols-2 gap-6">
              <WeddingMenuCard 
                title="Applewood-Smoked Herb Chicken" 
                description="Juicy chicken smoked over applewood, infused with aromatic herbs for tender, flavorful depth."
                delay={200}
              />
              
              <WeddingMenuCard 
                title="Hickory-Smoked Beef Brisket" 
                description="Melt-in-your-mouth brisket, slow-cooked over hickory wood for bold, smoky richness."
                delay={300}
              />
              
              <WeddingMenuCard 
                title="Glazed Honey-Bourbon Ham" 
                description="Hand-carved ham, cured and glazed with apple, bourbon, and clove—balancing sweet and savory beautifully."
                delay={400}
              />
              
              <WeddingMenuCard 
                title="Lemon-Honey Seared Salmon" 
                description="Fresh Atlantic salmon seared and glazed with a bright lemon-honey reduction."
                delay={500}
              />
              
              <WeddingMenuCard 
                title="Hand-Pulled Smoked Pork Shoulder" 
                description="Succulent pork shoulder slow-smoked and pulled to perfection, served with our signature sauce."
                delay={600}
              />
              
              <WeddingMenuCard 
                title="Honey-Glazed Ribs" 
                description="Fall-off-the-bone tender ribs brushed with a sweet and savory house-made honey BBQ glaze."
                delay={700}
              />
              
              <WeddingMenuCard 
                title="Cajun Slow Cooked Turkey Wings" 
                description="Slow-simmered turkey wings seasoned with Cajun seasonings."
                delay={800}
              />
              
              <WeddingMenuCard 
                title="Creamy Fettuccine Alfredo" 
                description="Silken Alfredo sauce tossed with fettuccine and your choice of herb-grilled chicken or sautéed shrimp."
                delay={900}
              />
              
              <WeddingMenuCard 
                title="Homestyle Glazed Meatloaf" 
                description="A comforting classic reimagined—moist beef meatloaf with a tomato glaze and fresh herbs."
                delay={1000}
              />
              
              <WeddingMenuCard 
                title="Smothered Pork Chops" 
                description="Bone-in chops gently simmered in savory gravy with tender onions and vibrant bell peppers."
                delay={1100}
              />
              
              <WeddingMenuCard 
                title="Buttermilk Fried Chicken" 
                description="Golden-crisp chicken seasoned to perfection, offering a sophisticated take on a Southern tradition."
                delay={1200}
              />
              
              <WeddingMenuCard 
                title="Signature Lowcountry Boil" 
                description="A coastal celebration of shrimp, sausage, corn, and potatoes, simmered in bold, aromatic spices."
                delay={1300}
              />
                </div>
              </section>

              {/* Artful Accompaniments */}
              <section>
                {(() => {
                  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
                    variant: 'ios-spring', 
                    delay: 0,
                    mobile: { delay: 0 },
                    desktop: { delay: 100 }
                  });
                  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
                  
                  return (
                    <div ref={headerRef} className={`text-center mb-8 lg:mb-12 ${headerAnimationClass}`}>
                      <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                        Artful Accompaniments
                      </h2>
                      <p className="text-lg text-muted-foreground italic">
                        Side dishes that harmonize beautifully with your entrées
                      </p>
                    </div>
                  );
                })()}
                
                <div className="grid md:grid-cols-2 gap-6">
              <WeddingMenuCard 
                title="Creamy Southern Macaroni & Cheese" 
                description="Baked to perfection in a rich, velvety blend of fine cheeses."
                delay={200}
              />
              
              <WeddingMenuCard 
                title="Classic Southern Potato Salad" 
                description="Traditional creamy potato salad with a tangy finish and time-honored Southern flavor."
                delay={300}
              />
              
              <WeddingMenuCard 
                title="Steamed Garden Green Beans" 
                description="Fresh green beans lightly steamed and finished with herbs for a clean, crisp bite."
                delay={400}
              />
              
              <WeddingMenuCard 
                title="Slow-Simmered Cabbage" 
                description="Tender cabbage seasoned with soul food spices, cooked low and slow for rich flavor."
                delay={500}
              />
              
              <WeddingMenuCard 
                title="Butter Sweet Corn" 
                description="Golden kernels simmered with real butter for a rich and comforting side."
                delay={600}
              />
              
              <WeddingMenuCard 
                title="Garlic Butter Mashed Potatoes" 
                description="Fluffy mashed potatoes blended with roasted garlic and smooth butter."
                delay={700}
              />
              
              <WeddingMenuCard 
                title="House-Made Pan Gravy" 
                description="A savory, silky gravy crafted from pan drippings and aromatic herbs—perfect for finishing."
                delay={800}
              />
              
              <WeddingMenuCard 
                title="Herbed Yellow Rice" 
                description="Fragrant yellow rice seasoned with a blend of herbs and spices for vibrant flavor and color."
                delay={900}
              />
              
              <WeddingMenuCard 
                title="Honey-Roasted Yams with Warm Spices" 
                description="Tender yams glazed with honey, cinnamon, and nutmeg—sweet, spiced, and nostalgic."
                delay={1000}
              />
              
              <WeddingMenuCard 
                title="Seasonal Vegetable Medley" 
                description="A colorful assortment of farm-fresh vegetables sautéed and lightly seasoned to perfection."
                delay={1100}
              />
                </div>
              </section>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {(() => {
            const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
              variant: 'elastic', 
              delay: 0,
              mobile: { delay: 0 },
              desktop: { delay: 100 }
            });
            const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
            
            return (
              <Card ref={cardRef} className={`shadow-elegant ${cardAnimationClass}`}>
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
            );
          })()}

          {(() => {
            const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
              variant: 'elastic', 
              delay: 200,
              mobile: { delay: 150 },
              desktop: { delay: 250 }
            });
            const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
            
            return (
              <Card ref={cardRef} className={`shadow-elegant ${cardAnimationClass}`}>
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
            );
          })()}
            </div>
          </div>
        </SectionCard>

        <CTASection
          title="Create Your Perfect Wedding Menu"
          description="Let us design a custom menu that reflects your style and creates lasting memories for your special day."
          buttons={[
            {
              text: "Call (843) 970-0265",
              href: "tel:8439700265",
              variant: "cta"
            },
            {
              text: "Email for Quote",
              href: "mailto:soultrainseatery@gmail.com",
              variant: "cta-white"
            }
          ]}
          footer="Serving Charleston, SC and surrounding Lowcountry areas"
        />
    </div>
  );
};

export default WeddingMenu;