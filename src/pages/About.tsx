import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Users, Phone, Mail, MapPin } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero section-padding">
      <div className="container-narrow animate-fade-in">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="flex justify-center mb-6">
            <Users className="w-12 h-12 text-primary hover:text-primary-glow transition-colors duration-300" />
          </div>
          <h1 className="mb-8">
            About Soul Train's Eatery
          </h1>
          
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Where passion meets Southern hospitality, creating unforgettable culinary experiences for over 8 flavorful years.
          </p>
          
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8 animate-scale-in">
            <div className="relative w-48 h-48 lg:w-56 lg:h-56 shadow-glow border-8 border-white rounded-full overflow-hidden hover-lift group">
              <img 
                src="/lovable-uploads/7386b87d-cf31-4aad-a072-4dc06d9d2a3a.png" 
                alt="Chef Dominick 'Train' Ward working in the kitchen with professional expertise"
                className="image-responsive group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <p className="text-lg text-muted-foreground mt-4 font-medium text-center">
              Chef Dominick "Train" Ward - Master of BBQ Excellence
            </p>
          </div>
        </div>

        {/* Main Story */}
        <Card className="mb-12 shadow-elegant card-interactive">
          <CardContent className="space-content">
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
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          <Card className="shadow-card card-interactive">
            <CardContent className="space-content-sm">
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

          <Card className="shadow-card card-interactive overflow-hidden group">
            <div className="relative h-40 sm:h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/6fa5bcaf-1613-416b-babc-289ac84bb501.png" 
                alt="Beautiful cupcake display by Tanya Ward featuring various flavors and elegant decorations" 
                className="image-card group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <CardContent className="space-content-sm">
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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-12">
          {/* Image Section */}
          <div className="relative order-2 lg:order-1">
            <div className="relative w-full rounded-lg overflow-hidden shadow-elegant hover-lift group">
              <img 
                src="/lovable-uploads/8268fc9a-93a0-4b72-a923-95fc0f10b0c0.png" 
                alt="Chef Dominick 'Train' Ward and Tanya Ward, the founders of Soul Train's Eatery, wearing their signature red aprons"
                className="image-responsive group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Promise Card */}
          <Card className="shadow-elegant bg-gradient-card h-full card-interactive order-1 lg:order-2">
            <CardContent className="text-center flex flex-col justify-center h-full space-content">
              <h3 className="text-3xl font-elegant font-bold text-foreground mb-6">
                Our Promise
              </h3>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We don't just bring food—we bring flavor, family, and unforgettable experiences. Let Soul Train's Eatery handle the kitchen while you enjoy the moment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quote Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="max-w-4xl mx-auto">
            <div className="text-2xl md:text-3xl lg:text-4xl font-script text-primary leading-relaxed hover:text-primary-glow transition-colors duration-300">
              🎉 Let Soul Train's Eatery take care of all your catering needs—so you can enjoy the celebration!
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <Card className="shadow-elegant bg-gradient-card text-center card-interactive">
          <CardContent className="space-content">
            <p className="text-xl text-muted-foreground mb-6">Ready to start planning your event?</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-8 mb-4">
              <a 
                href="tel:8439700265" 
                className="text-primary hover:text-primary-glow font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call (843) 970-0265
              </a>
              <a 
                href="mailto:soultrainseatery@gmail.com" 
                className="text-primary hover:text-primary-glow font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                soultrainseatery@gmail.com
              </a>
            </div>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              Charleston, SC
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;