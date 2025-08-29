import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { 
  UtensilsCrossed, 
  Leaf, 
  Star, 
  Crown,
  Coffee,
  Cake
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { getMenuItems, additionalMenuItems, dietaryRestrictions } from "@/data/menuData";

interface MenuSelectionStepProps {
  form: UseFormReturn<any>;
}

export const MenuSelectionStep = ({ form }: MenuSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  // Get menu items from shared data source
  const menuItems = getMenuItems();
  const ADDITIONAL_ITEMS = additionalMenuItems;

  // Comprehensive protein options
  const PROTEINS = [
    // Poultry
    { id: "fried-chicken", name: "Fried Chicken", isPopular: true, category: "poultry" },
    { id: "bbq-chicken", name: "BBQ Chicken", isPopular: true, category: "poultry" },
    { id: "baked-chicken", name: "Baked Chicken", category: "poultry" },
    { id: "chicken-tenders", name: "Chicken Tenders", category: "poultry" },
    { id: "turkey-wings", name: "Turkey Wings", category: "poultry" },
    { id: "chicken-alfredo", name: "Chicken Alfredo", category: "poultry" },
    { id: "chicken-wings", name: "Chicken Wings", category: "poultry" },
    
    // Beef & Pork
    { id: "pulled-pork", name: "Pulled Pork", isPopular: true, category: "beef-pork" },
    { id: "brisket", name: "Beef Brisket", isPremium: true, category: "beef-pork" },
    { id: "ribs", name: "BBQ Ribs", isPremium: true, category: "beef-pork" },
    { id: "smoked-sausage", name: "Smoked Sausage", category: "beef-pork" },
    { id: "fried-pork-chops", name: "Fried Pork Chops", category: "beef-pork" },
    { id: "smothered-pork-chops", name: "Smothered Pork Chops", category: "beef-pork" },
    { id: "meatloaf", name: "Meatloaf", category: "beef-pork" },
    { id: "hamburgers", name: "Hamburgers", category: "beef-pork" },
    
    // Pasta & Italian
    { id: "spaghetti", name: "Spaghetti", category: "pasta" },
    { id: "lasagna", name: "Lasagna", category: "pasta" },
    
    // Mexican
    { id: "tacos", name: "Tacos", category: "mexican" },
    
    // Seafood
    { id: "catfish", name: "Fried Catfish", isPopular: true, category: "seafood" },
    { id: "shrimp-alfredo", name: "Shrimp Alfredo", isPremium: true, category: "seafood" },
    { id: "low-country-boil", name: "Low Country Boil", isPremium: true, category: "seafood" },
    { id: "crabs", name: "Crabs", isPremium: true, category: "seafood" },
    { id: "fried-fish", name: "Fried Fish", category: "seafood" },
    
    // Plant-Based
    { id: "quinoa-power-bowl", name: "Quinoa Power Bowl", isDietary: true, category: "plant-based" },
    { id: "stuffed-bell-peppers", name: "Stuffed Bell Peppers", isDietary: true, category: "plant-based" },
    { id: "black-bean-burgers", name: "Black Bean Burgers", isDietary: true, category: "plant-based" },
    { id: "roasted-vegetable-medley", name: "Roasted Vegetable Medley", isDietary: true, category: "plant-based" },
  ];

  // Convert proteins to dropdown options
  const proteinOptions: Option[] = PROTEINS.map(protein => ({
    label: protein.name,
    value: protein.id,
    category: protein.category === "poultry" ? "Poultry" :
              protein.category === "beef-pork" ? "Beef & Pork" :
              protein.category === "pasta" ? "Pasta & Italian" :
              protein.category === "mexican" ? "Mexican" :
              protein.category === "seafood" ? "Seafood" :
              protein.category === "plant-based" ? "Plant-Based" : "Other"
  }));

  // Appetizer options
  const appetizerOptions: Option[] = ADDITIONAL_ITEMS.appetizers.map(app => ({
    label: app.name,
    value: app.id
  }));

  // Sides options  
  const sidesOptions: Option[] = ADDITIONAL_ITEMS.sides.map(side => ({
    label: side.name,
    value: side.id
  }));

  // Watch both proteins available toggle
  const bothProteinsAvailable = form.watch("both_proteins_available");

  const handleMenuItemToggle = (category: string, itemId: string) => {
    const currentItems = form.getValues(category) || [];
    const updatedItems = currentItems.includes(itemId)
      ? currentItems.filter((id: string) => id !== itemId)
      : [...currentItems, itemId];
    
    form.setValue(category, updatedItems);
  };

  const MenuItemCard = ({ item, isSelected, onToggle }: { item: any; isSelected: boolean; onToggle: () => void }) => (
    <div 
      className={`neumorphic-card-1 p-4 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-glow ${
        isSelected ? 'ring-2 ring-primary/30 bg-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <Checkbox checked={isSelected} onChange={() => {}} className="pointer-events-none" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.isPopular && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Popular</Badge>}
            {item.isPremium && <Badge variant="secondary" className="text-xs bg-gold/10 text-gold">Premium</Badge>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-elegant text-foreground mb-3 title-hover-motion">
          Craft Your Perfect Menu
        </h2>
        <p className="text-muted-foreground text-lg">
          Select from our comprehensive menu or tell us about your custom preferences.
        </p>
      </div>

      {/* Main Proteins */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-primary/5 via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            Main Proteins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <strong>Selection Guide:</strong> Guests will have the option to select between 1 protein selection. 
              Please indicate if you would like guests to have the option to have both proteins available.
            </p>
          </div>

          <FormField
            control={form.control}
            name="both_proteins_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-muted p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    Allow guests to choose from multiple proteins
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    When enabled, guests can select from {bothProteinsAvailable ? "all" : "one"} of your chosen proteins
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="primary_protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Select Proteins {bothProteinsAvailable ? "(Multiple allowed)" : "(Choose up to 2)"}
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    options={proteinOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Choose proteins for your event..."
                    searchPlaceholder="Search proteins..."
                    maxDisplayed={bothProteinsAvailable ? 5 : 2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="custom_menu_requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Custom protein requests or special preparations
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific protein preparations, dietary modifications, or custom requests..."
                    className="min-h-[100px] neumorphic-card-1 border-0 focus:ring-2 focus:ring-primary/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Appetizers & Starters */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-accent/5 via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-primary-foreground" />
            </div>
            Appetizers & Starters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="appetizers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Select Appetizers</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={appetizerOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Choose appetizers for your event..."
                    searchPlaceholder="Search appetizers..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Sides & Salads */}
      <Card className="neumorphic-card-1 border-0 bg-gradient-to-br from-secondary/5 via-card/95 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-elegant">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            Sides & Salads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="sides"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Select Sides & Salads</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={sidesOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Choose sides and salads for your event..."
                    searchPlaceholder="Search sides..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
              {ADDITIONAL_ITEMS.desserts.map((dessert) => (
                <MenuItemCard 
                  key={dessert.id} 
                  item={dessert} 
                  isSelected={form.watch("desserts")?.includes(dessert.id)}
                  onToggle={() => handleMenuItemToggle("desserts", dessert.id)}
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
              {ADDITIONAL_ITEMS.drinks.map((drink) => (
                <MenuItemCard 
                  key={drink.id} 
                  item={drink} 
                  isSelected={form.watch("drinks")?.includes(drink.id)}
                  onToggle={() => handleMenuItemToggle("drinks", drink.id)}
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
            {dietaryRestrictions.map((restriction) => (
              <MenuItemCard 
                key={restriction.id} 
                item={restriction} 
                isSelected={form.watch("dietary_restrictions")?.includes(restriction.id)}
                onToggle={() => handleMenuItemToggle("dietary_restrictions", restriction.id)}
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