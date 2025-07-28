import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UtensilsCrossed, Heart, Cake, Coffee, Apple } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface MenuSelectionStepProps {
  form: UseFormReturn<any>;
}

const PROTEINS = [
  { id: "bbq-chicken", name: "BBQ Chicken", popular: true },
  { id: "grilled-salmon", name: "Grilled Salmon", premium: true },
  { id: "beef-brisket", name: "Beef Brisket", popular: true },
  { id: "pork-tenderloin", name: "Pork Tenderloin" },
  { id: "vegetarian-lasagna", name: "Vegetarian Lasagna", vegetarian: true },
  { id: "grilled-portobello", name: "Grilled Portobello", vegetarian: true },
];

const APPETIZERS = [
  { id: "spinach-artichoke-dip", name: "Spinach Artichoke Dip", popular: true },
  { id: "bruschetta", name: "Bruschetta", vegetarian: true },
  { id: "chicken-wings", name: "Chicken Wings", popular: true },
  { id: "shrimp-cocktail", name: "Shrimp Cocktail", premium: true },
  { id: "cheese-board", name: "Artisan Cheese Board", premium: true },
  { id: "deviled-eggs", name: "Deviled Eggs" },
];

const SIDES = [
  { id: "mac-cheese", name: "Mac & Cheese", popular: true },
  { id: "roasted-vegetables", name: "Roasted Vegetables", vegetarian: true },
  { id: "garlic-mashed-potatoes", name: "Garlic Mashed Potatoes", popular: true },
  { id: "caesar-salad", name: "Caesar Salad" },
  { id: "coleslaw", name: "Coleslaw" },
  { id: "rice-pilaf", name: "Rice Pilaf", vegetarian: true },
];

const DESSERTS = [
  { id: "chocolate-cake", name: "Chocolate Cake", popular: true },
  { id: "cheesecake", name: "New York Cheesecake" },
  { id: "fruit-tart", name: "Seasonal Fruit Tart" },
  { id: "cookies", name: "Assorted Cookies" },
  { id: "tiramisu", name: "Tiramisu", premium: true },
];

const DRINKS = [
  { id: "iced-tea", name: "Sweet & Unsweet Tea", popular: true },
  { id: "lemonade", name: "Fresh Lemonade" },
  { id: "coffee", name: "Coffee Service" },
  { id: "soft-drinks", name: "Assorted Soft Drinks" },
  { id: "water", name: "Bottled Water" },
];

const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "gluten-free", name: "Gluten-Free" },
  { id: "dairy-free", name: "Dairy-Free" },
  { id: "nut-free", name: "Nut-Free" },
  { id: "diabetic-friendly", name: "Diabetic-Friendly" },
];

export const MenuSelectionStep = ({ form }: MenuSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  const handleMenuItemToggle = (category: string, itemId: string, checked: boolean) => {
    const currentItems = form.getValues(category) || [];
    if (checked) {
      form.setValue(category, [...currentItems, itemId]);
    } else {
      form.setValue(category, currentItems.filter((item: string) => item !== itemId));
    }
  };

  const MenuItemCard = ({ item, category, icon }: { item: any; category: string; icon?: React.ReactNode }) => {
    const currentItems = form.watch(category) || [];
    const isSelected = currentItems.includes(item.id);

    return (
      <div 
        className={`neumorphic-card-1 p-4 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-glow ${
          isSelected ? 'ring-2 ring-primary/30 bg-primary/5' : ''
        }`}
        onClick={() => handleMenuItemToggle(category, item.id, !isSelected)}
      >
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={isSelected}
            onChange={() => {}}
            className="pointer-events-none"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium">{item.name}</span>
              {item.popular && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Popular
                </Badge>
              )}
              {item.premium && (
                <Badge variant="secondary" className="text-xs bg-gold/10 text-gold">
                  Premium
                </Badge>
              )}
              {item.vegetarian && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  🌱 V
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Craft Your Perfect Menu
        </h2>
        <p className="text-muted-foreground text-lg">
          Select from our most popular items or tell us about your custom preferences.
        </p>
      </div>

      {/* Proteins Section */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            Main Proteins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {PROTEINS.map((protein) => (
              <MenuItemCard 
                key={protein.id} 
                item={protein} 
                category="primary_protein" 
                icon={<UtensilsCrossed className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </div>
          
          <FormField
            control={form.control}
            name="custom_menu_requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Custom Protein Requests
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about any specific proteins or preparations you'd like..."
                    className="min-h-[80px] neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                    onKeyDown={(e) => {
                      // Prevent any form submission from Enter key
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        // Allow line breaks with Shift+Enter
                        if (e.shiftKey) {
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const value = textarea.value;
                          const newValue = value.substring(0, start) + '\n' + value.substring(end);
                          textarea.value = newValue;
                          textarea.selectionStart = textarea.selectionEnd = start + 1;
                        }
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Appetizers */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            Appetizers & Starters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {APPETIZERS.map((appetizer) => (
              <MenuItemCard 
                key={appetizer.id} 
                item={appetizer} 
                category="appetizers" 
                icon={<Heart className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sides */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Apple className="h-4 w-4 text-primary-foreground" />
            </div>
            Sides & Salads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {SIDES.map((side) => (
              <MenuItemCard 
                key={side.id} 
                item={side} 
                category="sides" 
                icon={<Apple className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Desserts */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Cake className="h-4 w-4 text-primary-foreground" />
              </div>
              Desserts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DESSERTS.map((dessert) => (
                <MenuItemCard 
                  key={dessert.id} 
                  item={dessert} 
                  category="desserts" 
                  icon={<Cake className="h-4 w-4 text-muted-foreground" />}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Drinks */}
        <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-elegant">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Coffee className="h-4 w-4 text-primary-foreground" />
              </div>
              Beverages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DRINKS.map((drink) => (
                <MenuItemCard 
                  key={drink.id} 
                  item={drink} 
                  category="drinks" 
                  icon={<Coffee className="h-4 w-4 text-muted-foreground" />}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dietary Restrictions */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-card via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="text-xl font-elegant">Dietary Restrictions & Special Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <MenuItemCard 
                key={restriction.id} 
                item={restriction} 
                category="dietary_restrictions" 
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name="guest_count_with_restrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Number of Guests with Dietary Restrictions
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 3 vegetarian, 1 gluten-free"
                    className="h-12 text-base neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">👨‍🍳 Chef's Note:</span> We can customize any menu item to accommodate dietary needs and preferences.
        </p>
      </div>
    </div>
  );
};