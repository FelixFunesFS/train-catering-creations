import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Award, Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SectionCard } from "@/components/ui/section-card";
const About = () => {
   return <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-24">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader title="About Soul Train's Eatery" description="Where passion meets Southern hospitality, creating unforgettable culinary experiences for over 8 flavorful years." icons={[<ChefHat className="h-6 w-6 sm:h-8 sm:w-8" />, <Award className="h-6 w-6 sm:h-8 sm:w-8" />, <Heart className="h-6 w-6 sm:h-8 sm:w-8" />]}>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 shadow-[0_0_30px_hsl(0_72%_50%_/_0.3)] border-8 border-white rounded-full overflow-hidden">
                  <OptimizedImage src="/lovable-uploads/7386b87d-cf31-4aad-a072-4dc06d9d2a3a.png" alt="Chef Dominick 'Train' Ward working in the kitchen with professional expertise" aspectRatio="aspect-square" className="object-center" priority />
                </div>
                <div className="text-lg text-muted-foreground mt-4 font-medium text-center">
                  <div>Chef Dominick "Train" Ward</div>
                  <div>Master Culinary Excellence</div>
                </div>
              </div>
            </PageHeader>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="mb-12 shadow-elegant">
              <CardContent className="p-8 lg:p-12">
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg leading-relaxed mb-6">
                    Soul Train's Eatery has been proudly serving the Lowcountry of South Carolina for over <strong>8 flavorful years!</strong> Founded by Chef Dominick "Train" Ward and his wife Tanya Ward—our talented Pastry Chef—Soul Train's is a family-run, community-rooted catering business where passion meets Southern hospitality.
                  </p>

                  <p className="text-lg leading-relaxed mb-6">
                    From elegant weddings and joyous baby showers to heartfelt bereavements and high-energy military promotions, we cater events of every kind with care, flavor, and professionalism. Whether it's a cozy backyard BBQ or a corporate conference for hundreds, Chef Train, with over <strong>two decades of grilling and culinary experience</strong>, leads our team with heart and precision.
                  </p>

                  <p className="text-lg leading-relaxed mb-6">
                    We're <strong>ServSafe certified</strong>, prompt, and polished—ensuring your event runs as smoothly as our creamy mac & cheese.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-elegant font-semibold text-foreground mb-4">
                    Signature Dishes
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Shrimp Alfredo</li>
                    <li>• Baked Salmon</li>
                    <li>• Slow-Smoked Brisket</li>
                    <li>• Good Old-Fashioned Ribs</li>
                    <li>• Red Beans & Rice</li>
                    <li>• Southern-Style Cabbage</li>
                    <li>• Jamaican Jerk Chicken</li>
                    <li>• Customizable Taco Platters</li>
                    <li>• Variety of Vegetarian Options</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-card overflow-hidden">
                <OptimizedImage src="/lovable-uploads/6fa5bcaf-1613-416b-babc-289ac84bb501.png" alt="Beautiful cupcake display by Tanya Ward featuring various flavors and elegant decorations" aspectRatio="aspect-[5/3]" containerClassName="h-40" />
                
                <CardContent className="p-8">
                  <h3 className="text-2xl font-elegant font-semibold text-foreground mb-4">
                    Sweet Treats by Tanya
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Don't forget our sweet side—Tanya's cupcakes, dessert shots, and pastry creations are the perfect finishing touch to any celebration.
                  </p>
                  <p className="text-sm text-primary font-medium">
                    Ask about our customizable menu options!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <OptimizedImage src="/lovable-uploads/8268fc9a-93a0-4b72-a923-95fc0f10b0c0.png" alt="Chef Dominick 'Train' Ward and Tanya Ward, the founders of Soul Train's Eatery, wearing their signature red aprons" aspectRatio="aspect-[4/3]" containerClassName="w-full h-64 md:h-80 lg:h-96 rounded-lg shadow-elegant" className="object-[center_20%]" />
              </div>

              <Card className="shadow-elegant bg-gradient-card h-64 md:h-80 lg:h-96">
                <CardContent className="p-6 lg:p-8 text-center flex flex-col justify-center h-full">
                  <h3 className="text-3xl font-elegant font-bold text-foreground mb-6">
                    Our Promise
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    We don't just bring food—we bring flavor, family, and unforgettable experiences. Let Soul Train's Eatery handle the kitchen while you enjoy the moment.
                  </p>
                  <div className="text-xl md:text-2xl font-script text-primary leading-relaxed mt-8">
                    🎉 Let Soul Train's Eatery take care of all your catering needs—so you can enjoy the celebration!
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionCard>


        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-elegant bg-gradient-card text-center">
              <CardContent className="p-8 lg:p-12">
                <p className="text-xl text-muted-foreground mb-6">Ready to start planning your event?</p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-8 mb-4">
                  <a href="tel:8439700265" className="text-primary hover:text-primary-glow font-medium text-lg transition-colors">
                    📞 Call (843) 970-0265
                  </a>
                  <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium text-lg transition-colors">
                    ✉️ soultrainseatery@gmail.com
                  </a>
                </div>
                <p className="text-muted-foreground">📍 Charleston, SC</p>
              </CardContent>
            </Card>
          </div>
        </SectionCard>
    </div>;
};
export default About;