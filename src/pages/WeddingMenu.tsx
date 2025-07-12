import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Heart, Star, Crown } from "lucide-react";

const WeddingMenu = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
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

        {/* Menu Sections */}
        <div className="space-y-12 lg:space-y-16">
          {/* Hors d'Oeuvres & Small Bites */}
          <section>
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                Hors d'Oeuvres & Small Bites
              </h2>
              <p className="text-lg text-muted-foreground italic">
                Artfully crafted starters to elevate cocktail hours and refined gatherings
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Fresh Local Fruit Platter</h4>
                  <p className="text-sm text-muted-foreground">An elegant arrangement of the season's finest locally sourced fruits, artfully displayed for visual and flavorful delight.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Exquisite Cheese Platter</h4>
                  <p className="text-sm text-muted-foreground">A curated selection of gourmet cheeses, served with artisan crackers and refined accompaniments.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Signature Charcuterie Board</h4>
                  <p className="text-sm text-muted-foreground">A luxurious array of cured meats, cheeses, fruits, nuts, and artisanal bites, perfect for sophisticated mingling.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Grazing Table</h4>
                  <p className="text-sm text-muted-foreground">An abundant and visually stunning spread of sweet and savory offerings, ideal for sharing and conversation.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Chocolate-Covered Fruit</h4>
                  <p className="text-sm text-muted-foreground">Hand-dipped seasonal fruits—strawberries, pineapples, and more—enrobed in premium chocolate for a decadent finish.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Slow-Smoked Chicken Sliders</h4>
                  <p className="text-sm text-muted-foreground">Tender smoked chicken nestled in soft rolls, topped with house-made slaw and our signature sauce.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Slow-Smoked Pork Sliders</h4>
                  <p className="text-sm text-muted-foreground">Savory pulled pork slow-cooked to perfection, served on brioche with tangy pickles and house BBQ sauce.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Italian-Style Meatballs</h4>
                  <p className="text-sm text-muted-foreground">Succulent beef meatballs simmered in a rich marinara, finished with shaved parmesan and garden herbs.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Velvety Deviled Eggs</h4>
                  <p className="text-sm text-muted-foreground">A Southern classic with a refined touch—smooth, creamy filling with a delicate hint of spice.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Mini Chicken & Waffles</h4>
                  <p className="text-sm text-muted-foreground">A playful upscale twist on a Southern favorite—crispy chicken atop savory waffles, finished with a maple butter glaze.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Tomato Caprese Skewers</h4>
                  <p className="text-sm text-muted-foreground">Cherry tomatoes, fresh mozzarella, and basil leaves, delicately drizzled with aged balsamic reduction.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Petite Loaded Potato Bites</h4>
                  <p className="text-sm text-muted-foreground">Baby potatoes filled with artisan cheese, sour cream, and fresh chives—comfort in a bite.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Heirloom Tomato Bruschetta</h4>
                  <p className="text-sm text-muted-foreground">Crisp crostini topped with a medley of heirloom tomatoes, garlic, and fresh basil.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Smoked Salmon Cucumber Rounds</h4>
                  <p className="text-sm text-muted-foreground">Delicate smoked salmon served on crisp cucumber slices, finished with dill-infused cream cheese.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Signature Entrées */}
          <section>
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                Signature Entrées
              </h2>
              <p className="text-lg text-muted-foreground italic">
                Premium proteins, thoughtfully prepared for elegant affairs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Applewood-Smoked Herb Chicken</h4>
                  <p className="text-sm text-muted-foreground">Juicy chicken smoked over applewood, infused with aromatic herbs for tender, flavorful depth.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Hickory-Smoked Beef Brisket</h4>
                  <p className="text-sm text-muted-foreground">Melt-in-your-mouth brisket, slow-cooked over hickory wood for bold, smoky richness.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Glazed Honey-Bourbon Ham</h4>
                  <p className="text-sm text-muted-foreground">Hand-carved ham, cured and glazed with apple, bourbon, and clove—balancing sweet and savory beautifully.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Lemon-Honey Seared Salmon</h4>
                  <p className="text-sm text-muted-foreground">Fresh Atlantic salmon seared and glazed with a bright lemon-honey reduction.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Hand-Pulled Smoked Pork Shoulder</h4>
                  <p className="text-sm text-muted-foreground">Succulent pork shoulder slow-smoked and pulled to perfection, served with our signature sauce.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Honey-Glazed Ribs</h4>
                  <p className="text-sm text-muted-foreground">Fall-off-the-bone tender ribs brushed with a sweet and savory house-made honey BBQ glaze.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Cajun Slow Cooked Turkey Wings</h4>
                  <p className="text-sm text-muted-foreground">Slow-simmered turkey wings seasoned with Cajun seasonings.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Creamy Fettuccine Alfredo</h4>
                  <p className="text-sm text-muted-foreground">Silken Alfredo sauce tossed with fettuccine and your choice of herb-grilled chicken or sautéed shrimp.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Homestyle Glazed Meatloaf</h4>
                  <p className="text-sm text-muted-foreground">A comforting classic reimagined—moist beef meatloaf with a tomato glaze and fresh herbs.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Smothered Pork Chops</h4>
                  <p className="text-sm text-muted-foreground">Bone-in chops gently simmered in savory gravy with tender onions and vibrant bell peppers.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Buttermilk Fried Chicken</h4>
                  <p className="text-sm text-muted-foreground">Golden-crisp chicken seasoned to perfection, offering a sophisticated take on a Southern tradition.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Signature Lowcountry Boil</h4>
                  <p className="text-sm text-muted-foreground">A coastal celebration of shrimp, sausage, corn, and potatoes, simmered in bold, aromatic spices.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Artful Accompaniments */}
          <section>
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
                Artful Accompaniments
              </h2>
              <p className="text-lg text-muted-foreground italic">
                Side dishes that harmonize beautifully with your entrées
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Creamy Southern Macaroni & Cheese</h4>
                  <p className="text-sm text-muted-foreground">Baked to perfection in a rich, velvety blend of fine cheeses.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Classic Southern Potato Salad</h4>
                  <p className="text-sm text-muted-foreground">Traditional creamy potato salad with a tangy finish and time-honored Southern flavor.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Steamed Garden Green Beans</h4>
                  <p className="text-sm text-muted-foreground">Fresh green beans lightly steamed and finished with herbs for a clean, crisp bite.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Slow-Simmered Cabbage</h4>
                  <p className="text-sm text-muted-foreground">Tender cabbage seasoned with soul food spices, cooked low and slow for rich flavor.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Butter Sweet Corn</h4>
                  <p className="text-sm text-muted-foreground">Golden kernels simmered with real butter for a rich and comforting side.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Garlic Butter Mashed Potatoes</h4>
                  <p className="text-sm text-muted-foreground">Fluffy mashed potatoes blended with roasted garlic and smooth butter.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">House-Made Pan Gravy</h4>
                  <p className="text-sm text-muted-foreground">A savory, silky gravy crafted from pan drippings and aromatic herbs—perfect for finishing.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Herbed Yellow Rice</h4>
                  <p className="text-sm text-muted-foreground">Fragrant yellow rice seasoned with a blend of herbs and spices for vibrant flavor and color.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Honey-Roasted Yams with Warm Spices</h4>
                  <p className="text-sm text-muted-foreground">Tender yams glazed with honey, cinnamon, and nutmeg—sweet, spiced, and nostalgic.</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-elegant font-semibold text-foreground mb-2">Seasonal Vegetable Medley</h4>
                  <p className="text-sm text-muted-foreground">A colorful assortment of farm-fresh vegetables sautéed and lightly seasoned to perfection.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Event Types */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16 mt-16 md:mt-20 lg:mt-24">
          <Card className="shadow-card text-center hover-scale transition-all duration-300 overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={16/9}>
                <img 
                  src="/lovable-uploads/269bd0e4-4a19-4f14-b966-7b3173a10b95.png" 
                  alt="Elegant wedding reception setup with beautiful floral arrangements and draped tables"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
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

          <Card className="shadow-card text-center hover-scale transition-all duration-300 overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={16/9}>
                <img 
                  src="/lovable-uploads/d4bf7685-b46c-4c39-8a28-1d003b978403.png" 
                  alt="Elegant outdoor catering setup with chafing dishes and floral decorations"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
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

          <Card className="shadow-card text-center hover-scale transition-all duration-300 overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={16/9}>
                <img 
                  src="/lovable-uploads/cf6d0cd4-02bd-4607-b658-14a809d30275.png" 
                  alt="Military honor guard ceremony with elegant charcuterie board catering"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
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
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
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
          <CardContent className="p-6 lg:p-8 text-center">
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