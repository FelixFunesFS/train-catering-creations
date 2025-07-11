import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-8">
            About Soul Train's Eatery
          </h1>
          
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Where passion meets Southern hospitality, creating unforgettable culinary experiences for over 8 flavorful years.
          </p>
          
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 lg:w-56 lg:h-56 shadow-elegant border-4 border-background rounded-full overflow-hidden">
              <img 
                src="/lovable-uploads/7386b87d-cf31-4aad-a072-4dc06d9d2a3a.png" 
                alt="Chef Dominick 'Train' Ward working in the kitchen with professional expertise"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <p className="text-lg text-muted-foreground mt-4 font-medium text-center">
              Chef Dominick "Train" Ward - Master of BBQ Excellence
            </p>
          </div>
        </div>

        {/* Main Story */}
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


        {/* Our Specialties */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
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
            <div className="relative h-40 overflow-hidden">
              <img 
                src="/lovable-uploads/6fa5bcaf-1613-416b-babc-289ac84bb501.png" 
                alt="Beautiful cupcake display by Tanya Ward featuring various flavors and elegant decorations" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
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

        {/* Mission Statement */}
        <Card className="shadow-elegant bg-gradient-card overflow-hidden">
          <div className="relative h-64 overflow-hidden">
            <img 
              src="/lovable-uploads/8268fc9a-93a0-4b72-a923-95fc0f10b0c0.png" 
              alt="Chef Dominick 'Train' Ward and Tanya Ward, the founders of Soul Train's Eatery, wearing their signature red aprons"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <CardContent className="p-8 lg:p-12 text-center">
            <h3 className="text-3xl font-elegant font-bold text-foreground mb-6">
              Our Promise
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              We don't just bring food—we bring flavor, family, and unforgettable experiences. Let Soul Train's Eatery handle the kitchen while you enjoy the moment.
            </p>
            <div className="text-2xl font-script text-primary">
              🎉 Let Soul Train's Eatery take care of all your catering needs—so you can enjoy the celebration!
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Ready to start planning your event?</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
            <a href="tel:8439700265" className="text-primary hover:text-primary-glow font-medium">
              Call (843) 970-0265
            </a>
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium">
              soultrainseatery@gmail.com
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Charleston, SC</p>
        </div>
      </div>
    </div>
  );
};

export default About;