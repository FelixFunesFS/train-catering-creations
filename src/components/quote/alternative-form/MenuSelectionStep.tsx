import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckboxCardGrid, CardOption } from "@/components/ui/checkbox-card-grid";
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
  trackFieldInteraction: (fieldName: string) => void;
  variant?: 'regular' | 'wedding';
}

export const MenuSelectionStep = ({ form, trackFieldInteraction, variant = 'regular' }: MenuSelectionStepProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('fade-up', isVisible);

  // Get menu items from shared data source
  const menuItems = getMenuItems(variant);
  const ADDITIONAL_ITEMS = additionalMenuItems;

  // Comprehensive protein options
  const REGULAR_PROTEINS = [
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

  const WEDDING_PROTEINS = [
    // Premium Poultry
    { id: "herb-roasted-chicken", name: "Herb-Roasted Chicken Breast", isPopular: true, isPremium: true, category: "poultry" },
    { id: "chicken-piccata", name: "Chicken Piccata", isPremium: true, category: "poultry" },
    { id: "stuffed-chicken", name: "Stuffed Chicken Breast", isPremium: true, category: "poultry" },
    { id: "chicken-marsala", name: "Chicken Marsala", isPremium: true, category: "poultry" },
    { id: "roasted-turkey", name: "Roasted Turkey Breast", isPremium: true, category: "poultry" },
    
    // Premium Beef
    { id: "prime-rib", name: "Prime Rib", isPremium: true, isPopular: true, category: "beef" },
    { id: "beef-tenderloin", name: "Beef Tenderloin", isPremium: true, isPopular: true, category: "beef" },
    { id: "filet-mignon", name: "Filet Mignon", isPremium: true, category: "beef" },
    { id: "beef-wellington", name: "Beef Wellington", isPremium: true, category: "beef" },
    { id: "short-ribs", name: "Braised Short Ribs", isPremium: true, category: "beef" },
    
    // Premium Pork
    { id: "pork-tenderloin", name: "Pork Tenderloin", isPremium: true, category: "pork" },
    { id: "glazed-ham", name: "Glazed Ham", isPremium: true, category: "pork" },
    { id: "pork-chops-premium", name: "Herb-Crusted Pork Chops", isPremium: true, category: "pork" },
    
    // Premium Seafood
    { id: "lobster-tail", name: "Lobster Tail", isPremium: true, isPopular: true, category: "seafood" },
    { id: "crab-cakes", name: "Jumbo Lump Crab Cakes", isPremium: true, isPopular: true, category: "seafood" },
    { id: "grilled-salmon", name: "Grilled Salmon", isPremium: true, category: "seafood" },
    { id: "shrimp-scampi", name: "Shrimp Scampi", isPremium: true, category: "seafood" },
    { id: "seafood-medley", name: "Seafood Medley", isPremium: true, category: "seafood" },
    { id: "sea-bass", name: "Chilean Sea Bass", isPremium: true, category: "seafood" },
    
    // Elegant Vegetarian
    { id: "stuffed-portobello", name: "Stuffed Portobello Mushroom", isDietary: true, isPremium: true, category: "vegetarian" },
    { id: "vegetable-wellington", name: "Vegetable Wellington", isDietary: true, isPremium: true, category: "vegetarian" },
    { id: "eggplant-parmesan", name: "Eggplant Parmesan", isDietary: true, category: "vegetarian" },
  ];

  const PROTEINS = variant === 'wedding' ? WEDDING_PROTEINS : REGULAR_PROTEINS;

  // Convert proteins to card options
  const proteinCardOptions: CardOption[] = PROTEINS.map(protein => ({
    id: protein.id,
    name: protein.name,
    isPopular: protein.isPopular,
    isPremium: protein.isPremium,
    isDietary: protein.isDietary,
    category: protein.category
  }));

  // Appetizer card options
  const appetizerCardOptions: CardOption[] = menuItems.appetizers.map(app => ({
    id: app.id,
    name: app.name
  }));

  // Sides card options  
  const sidesCardOptions: CardOption[] = menuItems.sides.map(side => ({
    id: side.id,
    name: side.name
  }));

  // Dessert card options
  const dessertCardOptions: CardOption[] = menuItems.desserts.map(dessert => ({
    id: dessert.id,
    name: dessert.name
  }));

  // Drinks card options
  const drinkCardOptions: CardOption[] = ADDITIONAL_ITEMS.drinks.map(drink => ({
    id: drink.id,
    name: drink.name
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
      {/* Main Proteins */}
      <div className="space-y-6">
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
                <FormLabel className="text-base font-medium mb-4 block">
                  Select Proteins {bothProteinsAvailable ? "(Multiple allowed)" : "(Choose up to 2)"}
                </FormLabel>
                <FormControl>
                  <CheckboxCardGrid
                    options={proteinCardOptions}
                    selected={field.value || []}
                    onChange={(value) => {
                      trackFieldInteraction('primary_protein');
                      field.onChange(value);
                    }}
                    columns={2}
                    showLimit={8}
                    categoryLabel="Proteins"
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
      </div>

      {/* Appetizers & Starters */}
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="appetizers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-4 block">Select Appetizers</FormLabel>
                <FormControl>
                  <CheckboxCardGrid
                    options={appetizerCardOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    columns={2}
                    showLimit={6}
                    categoryLabel="Appetizers"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>

      {/* Sides & Salads */}
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="sides"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-4 block">Select Sides & Salads</FormLabel>
                <FormControl>
                  <CheckboxCardGrid
                    options={sidesCardOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    columns={2}
                    showLimit={6}
                    categoryLabel="Sides"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Desserts */}
        <div className="space-y-6">
            <FormField
              control={form.control}
              name="desserts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium mb-4 block">Select Desserts</FormLabel>
                  <FormControl>
                    <CheckboxCardGrid
                      options={dessertCardOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      columns={1}
                      showLimit={6}
                      categoryLabel="Desserts"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* Beverages */}
        <div className="space-y-6">
            <FormField
              control={form.control}
              name="drinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium mb-4 block">Select Beverages</FormLabel>
                  <FormControl>
                    <CheckboxCardGrid
                      options={drinkCardOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      columns={1}
                      showLimit={6}
                      categoryLabel="Beverages"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-4">
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
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">👨‍🍳 Chef's Note:</span> We can customize any menu item to accommodate dietary needs and preferences.
        </p>
      </div>
    </div>
  );
};