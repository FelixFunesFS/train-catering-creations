import { UseFormReturn, useWatch } from "react-hook-form";
import { memo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle } from "lucide-react";
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

const MenuSelectionStepComponent = ({ form, trackFieldInteraction, variant = 'regular' }: MenuSelectionStepProps) => {
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
  const bothProteinsAvailable = useWatch({
    control: form.control,
    name: "both_proteins_available"
  });

  return (
    <div ref={ref} className={`space-y-8 ${animationClass}`}>
      {/* Both Proteins Available Toggle */}
      <FormField
        control={form.control}
        name="both_proteins_available"
        render={({ field }) => (
          <FormItem>
            <div 
              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-muted p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => field.onChange(!field.value)}
            >
              <FormControl>
                {field.value ? (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium cursor-pointer">
                  Serve Both Proteins to All Guests
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  If checked and you select 2 proteins, all guests receive both options. Otherwise, proteins are alternatives.
                </p>
              </div>
            </div>
          </FormItem>
        )}
      />

      {/* Protein Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="proteins"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium mb-2 block">
                Select Proteins (Max 2) *
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={proteinOptions}
                  selected={field.value || []}
                  onChange={(value) => {
                    // Enforce max 2 selections
                    if (value.length <= 2) {
                      field.onChange(value);
                      trackFieldInteraction('proteins');
                    }
                  }}
                  placeholder="Search and select up to 2 proteins..."
                  searchPlaceholder="Search proteins..."
                  maxDisplayed={4}
                  className="input-neutral"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                ⭐ Popular • 💎 Premium • 🌱 Dietary-Friendly
              </p>
              {field.value && field.value.length >= 2 && (
                <p className="text-xs text-amber-600 mt-1">
                  Maximum reached. For additional proteins, add them in Special Requests.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
                  className="input-neutral"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Additional Items (Appetizers + Desserts + Beverages) */}
      <div className="grid md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="appetizers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium mb-2 block">Appetizers</FormLabel>
              <FormControl>
                <MultiSelect
                  options={appetizerOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select appetizers..."
                  searchPlaceholder="Search appetizers..."
                  maxDisplayed={2}
                  className="input-neutral"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desserts"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium mb-2 block">Desserts</FormLabel>
              <FormControl>
                <MultiSelect
                  options={dessertOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select desserts..."
                  searchPlaceholder="Search desserts..."
                  maxDisplayed={2}
                  className="input-neutral"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="drinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium mb-2 block">Beverages *</FormLabel>
              <FormControl>
                <MultiSelect
                  options={drinkOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select beverages..."
                  searchPlaceholder="Search beverages..."
                  maxDisplayed={2}
                  className="input-neutral"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Vegetarian Portions */}
      <FormField
        control={form.control}
        name="guest_count_with_restrictions"
        render={({ field }) => (
          <FormItem className="max-w-md">
            <FormLabel className="text-base font-medium mb-2 block">
              Vegetarian Portions
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Number of vegetarian meals needed"
                min="0"
                className="h-12 text-base input-neutral"
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">
              How many guests require vegetarian meal options?
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const MenuSelectionStep = MenuSelectionStepComponent;
