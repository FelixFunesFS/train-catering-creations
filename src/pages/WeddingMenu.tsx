import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { CollapsibleMenuSection } from "@/components/wedding/CollapsibleMenuSection";
import { MobileMenuNavigation } from "@/components/wedding/MobileMenuNavigation";
import { QuickActionButton } from "@/components/wedding/QuickActionButton";
import { WeddingMenuSplitHero } from "@/components/wedding/WeddingMenuSplitHero";

const WeddingMenu = () => {
  const { ref: eventCardsRef, isVisible: eventCardsVisible, variant: eventCardsVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 200,
    mobile: { delay: 150 },
    desktop: { delay: 250 }
  });

  const eventCardsAnimationClass = useAnimationClass(eventCardsVariant, eventCardsVisible);

  // Menu data organized for mobile-first approach
  const appetizers = [
    { title: "Fresh Local Fruit Platter", description: "An elegant arrangement of the season's finest locally sourced fruits, artfully displayed for visual and flavorful delight.", delay: 200, featured: true },
    { title: "Signature Charcuterie Board", description: "A luxurious array of cured meats, cheeses, fruits, nuts, and artisanal bites, perfect for sophisticated mingling.", delay: 300, featured: true },
    { title: "Exquisite Cheese Platter", description: "A curated selection of gourmet cheeses, served with artisan crackers and refined accompaniments.", delay: 400 },
    { title: "Grazing Table", description: "An abundant and visually stunning spread of sweet and savory offerings, ideal for sharing and conversation.", delay: 500 },
    { title: "Chocolate-Covered Fruit", description: "Hand-dipped seasonal fruits—strawberries, pineapples, and more—enrobed in premium chocolate for a decadent finish.", delay: 600 },
    { title: "Slow-Smoked Chicken Sliders", description: "Tender smoked chicken nestled in soft rolls, topped with house-made slaw and our signature sauce.", delay: 700 },
    { title: "Slow-Smoked Pork Sliders", description: "Savory pulled pork slow-cooked to perfection, served on brioche with tangy pickles and house BBQ sauce.", delay: 800 },
    { title: "Italian-Style Meatballs", description: "Succulent beef meatballs simmered in a rich marinara, finished with shaved parmesan and garden herbs.", delay: 900 },
    { title: "Velvety Deviled Eggs", description: "A Southern classic with a refined touch—smooth, creamy filling with a delicate hint of spice.", delay: 1000 },
    { title: "Mini Chicken & Waffles", description: "A playful upscale twist on a Southern favorite—crispy chicken atop savory waffles, finished with a maple butter glaze.", delay: 1100, featured: true },
    { title: "Tomato Caprese Skewers", description: "Cherry tomatoes, fresh mozzarella, and basil leaves, delicately drizzled with aged balsamic reduction.", delay: 1200 },
    { title: "Petite Loaded Potato Bites", description: "Baby potatoes filled with artisan cheese, sour cream, and fresh chives—comfort in a bite.", delay: 1300 },
    { title: "Heirloom Tomato Bruschetta", description: "Crisp crostini topped with a medley of heirloom tomatoes, garlic, and fresh basil.", delay: 1400 },
    { title: "Smoked Salmon Cucumber Rounds", description: "Delicate smoked salmon served on crisp cucumber slices, finished with dill-infused cream cheese.", delay: 1500 }
  ];

  const entrees = [
    { title: "Applewood-Smoked Herb Chicken", description: "Juicy chicken smoked over applewood, infused with aromatic herbs for tender, flavorful depth.", delay: 200, featured: true },
    { title: "Hickory-Smoked Beef Brisket", description: "Melt-in-your-mouth brisket, slow-cooked over hickory wood for bold, smoky richness.", delay: 300, featured: true },
    { title: "Glazed Honey-Bourbon Ham", description: "Hand-carved ham, cured and glazed with apple, bourbon, and clove—balancing sweet and savory beautifully.", delay: 400 },
    { title: "Lemon-Honey Seared Salmon", description: "Fresh Atlantic salmon seared and glazed with a bright lemon-honey reduction.", delay: 500 },
    { title: "Hand-Pulled Smoked Pork Shoulder", description: "Succulent pork shoulder slow-smoked and pulled to perfection, served with our signature sauce.", delay: 600 },
    { title: "Honey-Glazed Ribs", description: "Fall-off-the-bone tender ribs brushed with a sweet and savory house-made honey BBQ glaze.", delay: 700 },
    { title: "Cajun Slow Cooked Turkey Wings", description: "Slow-simmered turkey wings seasoned with Cajun seasonings.", delay: 800 },
    { title: "Creamy Fettuccine Alfredo", description: "Silken Alfredo sauce tossed with fettuccine and your choice of herb-grilled chicken or sautéed shrimp.", delay: 900 },
    { title: "Homestyle Glazed Meatloaf", description: "A comforting classic reimagined—moist beef meatloaf with a tomato glaze and fresh herbs.", delay: 1000 },
    { title: "Smothered Pork Chops", description: "Bone-in chops gently simmered in savory gravy with tender onions and vibrant bell peppers.", delay: 1100 },
    { title: "Buttermilk Fried Chicken", description: "Golden-crisp chicken seasoned to perfection, offering a sophisticated take on a Southern tradition.", delay: 1200, featured: true },
    { title: "Signature Lowcountry Boil", description: "A coastal celebration of shrimp, sausage, corn, and potatoes, simmered in bold, aromatic spices.", delay: 1300 }
  ];

  const sides = [
    { title: "Creamy Southern Macaroni & Cheese", description: "Baked to perfection in a rich, velvety blend of fine cheeses.", delay: 200, featured: true },
    { title: "Classic Southern Potato Salad", description: "Traditional creamy potato salad with a tangy finish and time-honored Southern flavor.", delay: 300 },
    { title: "Steamed Garden Green Beans", description: "Fresh green beans lightly steamed and finished with herbs for a clean, crisp bite.", delay: 400 },
    { title: "Slow-Simmered Cabbage", description: "Tender cabbage seasoned with soul food spices, cooked low and slow for rich flavor.", delay: 500 },
    { title: "Butter Sweet Corn", description: "Golden kernels simmered with real butter for a rich and comforting side.", delay: 600 },
    { title: "Garlic Butter Mashed Potatoes", description: "Fluffy mashed potatoes blended with roasted garlic and smooth butter.", delay: 700, featured: true },
    { title: "House-Made Pan Gravy", description: "A savory, silky gravy crafted from pan drippings and aromatic herbs—perfect for finishing.", delay: 800 },
    { title: "Herbed Yellow Rice", description: "Fragrant yellow rice seasoned with a blend of herbs and spices for vibrant flavor and color.", delay: 900 },
    { title: "Honey-Roasted Yams with Warm Spices", description: "Tender yams glazed with honey, cinnamon, and nutmeg—sweet, spiced, and nostalgic.", delay: 1000 },
    { title: "Seasonal Vegetable Medley", description: "A colorful assortment of farm-fresh vegetables sautéed and lightly seasoned to perfection.", delay: 1100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <MobileMenuNavigation />
      <QuickActionButton />
      
      {/* Split Screen Hero */}
      <WeddingMenuSplitHero />
      
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          
          <div ref={eventCardsRef} className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 ${eventCardsAnimationClass}`}>
            <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300">
              <div className="relative h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
                <img 
                  src="/lovable-uploads/269bd0e4-4a19-4f14-b966-7b3173a10b95.png" 
                  alt="Elegant wedding reception setup with beautiful floral arrangements and draped tables"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-elegant font-semibold text-white mb-2">Weddings</h3>
                </div>
              </div>
            </div>

            <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300">
              <div className="relative h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
                <img 
                  src="/lovable-uploads/d4bf7685-b46c-4c39-8a28-1d003b978403.png" 
                  alt="Elegant outdoor catering setup with chafing dishes and floral decorations"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-elegant font-semibold text-white mb-2">Black Tie Events</h3>
                </div>
              </div>
            </div>

            <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300">
              <div className="relative h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
                <img 
                  src="/lovable-uploads/cf6d0cd4-02bd-4607-b658-14a809d30275.png" 
                  alt="Military honor guard ceremony with elegant charcuterie board catering"
                  className="w-full h-full object-cover object-[50%_35%] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-elegant font-semibold text-white mb-2">Military Functions</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 lg:space-y-16">
            <CollapsibleMenuSection
              id="appetizers"
              title="Hors d'Oeuvres & Small Bites"
              subtitle="Artfully crafted starters to elevate cocktail hours and refined gatherings"
              items={appetizers}
              defaultExpanded={false}
            />
            
            <CollapsibleMenuSection
              id="entrees"
              title="Signature Entrées"
              subtitle="Premium proteins, thoughtfully prepared for elegant affairs"
              items={entrees}
              defaultExpanded={false}
            />
            
            <CollapsibleMenuSection
              id="sides"
              title="Artful Accompaniments"
              subtitle="Side dishes that harmonize beautifully with your entrées"
              items={sides}
              defaultExpanded={false}
            />
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
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
      </section>

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
