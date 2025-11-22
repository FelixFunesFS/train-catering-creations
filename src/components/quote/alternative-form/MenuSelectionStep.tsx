import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import type { Option } from "@/components/ui/multi-select";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { getMenuItems, additionalMenuItems } from "@/data/menuData";
import { Badge } from "@/components/ui/badge";

interface MenuSelectionStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
  variant?: 'regular' | 'wedding';
}

export const MenuSelectionStep = ({ form, trackFieldInteraction, variant = 'regular' }: MenuSelectionStepProps) => {
  const { ref, isVisible, variant: animVariant } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass(animVariant, isVisible);

  // Get menu items from shared data source
  const menuItems = getMenuItems(variant);
  const ADDITIONAL_ITEMS = additionalMenuItems;

  // Comprehensive protein options
  const REGULAR_PROTEINS = [
    // Poultry
    { id: "fried-chicken", name: "Fried Chicken", isPopular: true, category: "Poultry" },
    { id: "bbq-chicken", name: "BBQ Chicken", isPopular: true, category: "Poultry" },
    { id: "baked-chicken", name: "Baked Chicken", category: "Poultry" },
    { id: "chicken-tenders", name: "Chicken Tenders", category: "Poultry" },
    { id: "turkey-wings", name: "Turkey Wings", category: "Poultry" },
    { id: "chicken-alfredo", name: "Chicken Alfredo", category: "Poultry" },
    { id: "chicken-wings", name: "Chicken Wings", category: "Poultry" },
    
    // Beef & Pork
    { id: "pulled-pork", name: "Pulled Pork", isPopular: true, category: "Beef & Pork" },
    { id: "brisket", name: "Beef Brisket", isPremium: true, category: "Beef & Pork" },
    { id: "ribs", name: "BBQ Ribs", isPremium: true, category: "Beef & Pork" },
    { id: "smoked-sausage", name: "Smoked Sausage", category: "Beef & Pork" },
    { id: "fried-pork-chops", name: "Fried Pork Chops", category: "Beef & Pork" },
    { id: "smothered-pork-chops", name: "Smothered Pork Chops", category: "Beef & Pork" },
    { id: "meatloaf", name: "Meatloaf", category: "Beef & Pork" },
    { id: "hamburgers", name: "Hamburgers", category: "Beef & Pork" },
    
    // Pasta & Italian
    { id: "spaghetti", name: "Spaghetti", category: "Pasta" },
    { id: "lasagna", name: "Lasagna", category: "Pasta" },
    
    // Mexican
    { id: "tacos", name: "Tacos", category: "Mexican" },
    
    // Seafood
    { id: "catfish", name: "Fried Catfish", isPopular: true, category: "Seafood" },
    { id: "shrimp-alfredo", name: "Shrimp Alfredo", isPremium: true, category: "Seafood" },
    { id: "low-country-boil", name: "Low Country Boil", isPremium: true, category: "Seafood" },
    { id: "crabs", name: "Crabs", isPremium: true, category: "Seafood" },
    { id: "fried-fish", name: "Fried Fish", category: "Seafood" },
    
    // Plant-Based
    { id: "quinoa-power-bowl", name: "Quinoa Power Bowl", isDietary: true, category: "Plant-Based" },
    { id: "stuffed-bell-peppers", name: "Stuffed Bell Peppers", isDietary: true, category: "Plant-Based" },
    { id: "black-bean-burgers", name: "Black Bean Burgers", isDietary: true, category: "Plant-Based" },
    { id: "roasted-vegetable-medley", name: "Roasted Vegetable Medley", isDietary: true, category: "Plant-Based" },
  ];

  const WEDDING_PROTEINS = [
    // Premium Poultry
    { id: "herb-roasted-chicken", name: "Herb-Roasted Chicken Breast", isPopular: true, category: "Poultry" },
    { id: "chicken-marsala", name: "Chicken Marsala", isPopular: true, category: "Poultry" },
    { id: "stuffed-chicken", name: "Stuffed Chicken Breast", isPremium: true, category: "Poultry" },
    { id: "cornish-hen", name: "Cornish Hen", isPremium: true, category: "Poultry" },
    
    // Premium Beef
    { id: "filet-mignon", name: "Filet Mignon", isPremium: true, isPopular: true, category: "Beef" },
    { id: "beef-wellington", name: "Beef Wellington", isPremium: true, category: "Beef" },
    { id: "prime-rib", name: "Prime Rib", isPremium: true, isPopular: true, category: "Beef" },
    { id: "ribeye-steak", name: "Ribeye Steak", isPremium: true, category: "Beef" },
    { id: "short-ribs", name: "Braised Short Ribs", isPremium: true, category: "Beef" },
    
    // Premium Seafood
    { id: "lobster-tail", name: "Lobster Tail", isPremium: true, isPopular: true, category: "Seafood" },
    { id: "crab-cakes", name: "Jumbo Lump Crab Cakes", isPremium: true, isPopular: true, category: "Seafood" },
    { id: "grilled-salmon", name: "Grilled Salmon", isPremium: true, category: "Seafood" },
    { id: "shrimp-scampi", name: "Shrimp Scampi", isPremium: true, category: "Seafood" },
    { id: "seafood-medley", name: "Seafood Medley", isPremium: true, category: "Seafood" },
    { id: "sea-bass", name: "Chilean Sea Bass", isPremium: true, category: "Seafood" },
    
    // Elegant Vegetarian
    { id: "stuffed-portobello", name: "Stuffed Portobello Mushroom", isDietary: true, isPremium: true, category: "Vegetarian" },
    { id: "vegetable-wellington", name: "Vegetable Wellington", isDietary: true, isPremium: true, category: "Vegetarian" },
    { id: "eggplant-parmesan", name: "Eggplant Parmesan", isDietary: true, category: "Vegetarian" },
  ];

  const PROTEINS = variant === 'wedding' ? WEDDING_PROTEINS : REGULAR_PROTEINS;

  // Convert to MultiSelect options with formatted labels
  const proteinOptions: Option[] = PROTEINS.map(protein => {
    let label = protein.name;
    if (protein.isPopular) label += " ⭐";
    if (protein.isPremium) label += " 💎";
    if (protein.isDietary) label += " 🌱";
    
    return {
      value: protein.id,
      label: label,
      category: protein.category
    };
  });

  const appetizerOptions: Option[] = menuItems.appetizers.map(app => ({
    value: app.id,
    label: app.name,
    category: "Appetizers"
  }));

  const sidesOptions: Option[] = menuItems.sides.map(side => ({
    value: side.id,
    label: side.name,
    category: "Sides"
  }));

  const dessertOptions: Option[] = menuItems.desserts.map(dessert => ({
    value: dessert.id,
    label: dessert.name,
    category: "Desserts"
  }));

  const drinkOptions: Option[] = ADDITIONAL_ITEMS.drinks.map(drink => ({
    value: drink.id,
    label: drink.name,
    category: "Beverages"
  }));

  // Watch both proteins available toggle
  const bothProteinsAvailable = form.watch("both_proteins_available");

  // Dietary restrictions options
  const dietaryOptions = [
    { id: "vegetarian", name: "Vegetarian" },
    { id: "vegan", name: "Vegan" },
    { id: "gluten-free", name: "Gluten-Free" },
    { id: "dairy-free", name: "Dairy-Free" },
    { id: "nut-allergies", name: "Nut Allergies" },
    { id: "halal", name: "Halal" },
    { id: "kosher", name: "Kosher" },
  ];

  const handleMenuItemToggle = (category: string, itemId: string) => {
    const currentItems = form.getValues(category) || [];
    const updatedItems = currentItems.includes(itemId)
      ? currentItems.filter((id: string) => id !== itemId)
      : [...currentItems, itemId];
    
    form.setValue(category, updatedItems);
  };

  const MenuItemCard = ({ item, isSelected, onToggle }: { item: any; isSelected: boolean; onToggle: () => void }) => (
    <div 
      className={`bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50 cursor-pointer transition-colors duration-300 hover:border-primary/50 ${
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
                <FormLabel className="text-base font-medium mb-2 block">
                  Select Proteins {bothProteinsAvailable ? "(Multiple allowed)" : "(Choose up to 2)"} *
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    options={proteinOptions}
                    selected={field.value || []}
                    onChange={(value) => {
                      trackFieldInteraction('primary_protein');
                      field.onChange(value);
                    }}
                    placeholder="Search and select proteins..."
                    searchPlaceholder="Search proteins..."
                    maxDisplayed={4}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  ⭐ Popular • 💎 Premium • 🌱 Dietary-Friendly
                </p>
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
                    className="min-h-[100px] input-clean"
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
                <FormLabel className="text-base font-medium mb-2 block">Select Appetizers</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={appetizerOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select appetizers..."
                    searchPlaceholder="Search appetizers..."
                    maxDisplayed={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>

      {/* Sides */}
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="sides"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-2 block">Select Sides *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={sidesOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select sides..."
                    searchPlaceholder="Search sides..."
                    maxDisplayed={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>

      {/* Desserts */}
      <div className="space-y-6">
          <FormField
            control={form.control}
            name="desserts"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-2 block">Select Desserts</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={dessertOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select desserts..."
                    searchPlaceholder="Search desserts..."
                    maxDisplayed={3}
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
                <FormLabel className="text-base font-medium mb-2 block">Select Beverages *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={drinkOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select beverages..."
                    searchPlaceholder="Search beverages..."
                    maxDisplayed={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-6">
        <div>
          <FormLabel className="text-base font-medium mb-4 block">
            Special Dietary Accommodations
          </FormLabel>
          <p className="text-sm text-muted-foreground mb-4">
            Select any dietary restrictions we should accommodate for your guests
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dietaryOptions.map((option) => {
              const currentRestrictions = form.watch("dietary_restrictions") || [];
              const isSelected = currentRestrictions.includes(option.id);

              return (
                <MenuItemCard
                  key={option.id}
                  item={option}
                  isSelected={isSelected}
                  onToggle={() => handleMenuItemToggle("dietary_restrictions", option.id)}
                />
              );
            })}
          </div>

          <FormField
            control={form.control}
            name="guest_count_with_restrictions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-sm">
                  Approximate number of guests with dietary restrictions
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    min="0"
                    className="h-12 text-base input-clean max-w-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
