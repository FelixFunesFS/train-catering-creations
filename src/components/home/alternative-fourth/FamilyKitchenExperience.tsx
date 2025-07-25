import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { ChefHat, Heart, Clock, Award, Users, Utensils } from "lucide-react";
// Using existing uploaded images for kitchen and feast scenes

export const FamilyKitchenExperience = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const { ref: recipesRef, getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 200,
    variant: 'slide-up'
  });

  const [activeRecipe, setActiveRecipe] = useState(0);

  const chefs = [
    {
      name: "Chef Dominick \"Train\" Ward",
      title: "Executive Chef & Co-Founder",
      specialties: ["Lowcountry Seafood", "BBQ & Smoking", "Southern Comfort Food"],
      experience: "25+ years",
      philosophy: "Every dish tells a story of Charleston's culinary heritage",
      signature: "Train's Famous Lowcountry Boil"
    },
    {
      name: "Pastry Chef Tanya Ward",
      title: "Pastry Chef & Co-Founder",
      specialties: ["Southern Desserts", "Wedding Cakes", "Seasonal Pastries"],
      experience: "20+ years",
      philosophy: "Sweet endings create lasting memories for families",
      signature: "Bourbon Peach Cobbler with Vanilla Bean Ice Cream"
    }
  ];

  const familyRecipes = [
    {
      name: "Grandmama's Shrimp & Grits",
      origin: "Family recipe since 1940s",
      description: "Stone-ground grits with fresh Lowcountry shrimp in a tasso ham gravy",
      cookTime: "45 minutes",
      serves: "8-10 people",
      tags: ["Signature Dish", "Gluten-Free Option", "Locally Sourced"],
      story: "Passed down from Chef Train's grandmother, this recipe uses Charleston's finest creek shrimp"
    },
    {
      name: "Charleston She-Crab Soup",
      origin: "Traditional Lowcountry recipe",
      description: "Rich, creamy soup with fresh crab meat and a splash of sherry",
      cookTime: "1 hour",
      serves: "6-8 people",
      tags: ["Award Winner", "Local Favorite", "Seasonal"],
      story: "A Charleston classic that took Chef Train years to perfect with local crab suppliers"
    },
    {
      name: "Bourbon Braised Short Ribs",
      origin: "Train family innovation",
      description: "Fall-off-the-bone tender ribs with Charleston bourbon and brown butter grits",
      cookTime: "3 hours",
      serves: "6-8 people",
      tags: ["Signature Dish", "Comfort Food", "Bourbon Infused"],
      story: "Chef Train's signature dish combining traditional techniques with local Charleston bourbon"
    },
    {
      name: "Tanya's Peach Cobbler",
      origin: "Ward family dessert tradition",
      description: "South Carolina peaches with buttermilk biscuit topping and vanilla bean ice cream",
      cookTime: "1 hour",
      serves: "10-12 people",
      tags: ["Family Recipe", "Seasonal", "House Made"],
      story: "Chef Tanya's grandmother's recipe using only South Carolina peaches at peak season"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background/80 to-accent/5">
      <ResponsiveWrapper>
        
        {/* Section Header with Logo */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery - Family Kitchen Experience"
              className="h-16 md:h-20 w-auto mx-auto mb-4"
            />
          </div>
          
          <h2 className={`font-elegant text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Our Family
            <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-2xl md:text-4xl lg:text-5xl mt-2">
              Kitchen Stories
            </span>
          </h2>
          <p className={`font-clean text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Meet the heart behind Soul Train's Eatery - Chef Train and Chef Tanya Ward, 
            where every recipe carries the warmth of family tradition and Charleston heritage.
          </p>
        </div>

        {/* Chef Spotlight */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <SectionContentCard>
            <div className="aspect-[4/3] mb-6 overflow-hidden rounded-lg">
              <OptimizedImage
                src="/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png"
                alt="Chef Dominick Train Ward in the kitchen preparing traditional Lowcountry cuisine"
                containerClassName="w-full h-full"
                className="object-cover"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
                Executive Chef
              </span>
            </div>
            
            <h3 className="font-playfair text-2xl font-bold mb-2">{chefs[0].name}</h3>
            <p className="text-muted-foreground mb-4">{chefs[0].philosophy}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm">{chefs[0].experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                <span className="text-sm">Signature Dishes</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Specialties:</h4>
              <div className="flex flex-wrap gap-2">
                {chefs[0].specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-accent/20 rounded-lg">
              <p className="text-sm font-medium text-red-600 mb-1">Signature Dish:</p>
              <p className="text-sm">{chefs[0].signature}</p>
            </div>
          </SectionContentCard>

          <SectionContentCard>
            <div className="aspect-[4/3] mb-6 overflow-hidden rounded-lg">
              <OptimizedImage
                src="/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png"
                alt="Pastry Chef Tanya Ward's beautiful Southern desserts and pastries"
                containerClassName="w-full h-full"
                className="object-cover"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
                Pastry Chef
              </span>
            </div>
            
            <h3 className="font-playfair text-2xl font-bold mb-2">{chefs[1].name}</h3>
            <p className="text-muted-foreground mb-4">{chefs[1].philosophy}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm">{chefs[1].experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                <span className="text-sm">Award Winning</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Specialties:</h4>
              <div className="flex flex-wrap gap-2">
                {chefs[1].specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-accent/20 rounded-lg">
              <p className="text-sm font-medium text-red-600 mb-1">Signature Dessert:</p>
              <p className="text-sm">{chefs[1].signature}</p>
            </div>
          </SectionContentCard>
        </div>

        {/* Family Recipe Cards */}
        <div className="mb-16">
          <h3 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12">
            Family Recipe
            <span className="block font-dancing text-red-600 text-xl md:text-3xl mt-2">
              Heritage Collection
            </span>
          </h3>
          
          <div ref={recipesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {familyRecipes.map((recipe, index) => (
              <SectionContentCard
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${getItemClassName(index)} ${
                  activeRecipe === index ? 'ring-2 ring-red-600/50 shadow-lg' : ''
                }`}
                style={getItemStyle(index)}
                onClick={() => setActiveRecipe(index)}
                interactive
              >
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    {recipe.origin}
                  </span>
                </div>
                
                <h4 className="font-playfair text-lg font-bold mb-2">{recipe.name}</h4>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-600" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-red-600" />
                    <span>{recipe.serves}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-red-600/10 text-red-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <span className="text-xs font-medium text-red-600">
                  Read Recipe Story →
                </span>
              </SectionContentCard>
            ))}
          </div>
        </div>

        {/* Featured Recipe Story */}
        <SectionContentCard className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
                  Featured Recipe
                </span>
              </div>
              
              <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
                {familyRecipes[activeRecipe].name}
              </h3>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{familyRecipes[activeRecipe].cookTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{familyRecipes[activeRecipe].serves}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {familyRecipes[activeRecipe].story}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {familyRecipes[activeRecipe].tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="aspect-square overflow-hidden rounded-lg">
              <OptimizedImage
                src="/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png"
                alt={`${familyRecipes[activeRecipe].name} - traditional Southern family recipe`}
                containerClassName="w-full h-full"
                className="object-cover"
              />
            </div>
          </div>
        </SectionContentCard>
      </ResponsiveWrapper>
    </section>
  );
};