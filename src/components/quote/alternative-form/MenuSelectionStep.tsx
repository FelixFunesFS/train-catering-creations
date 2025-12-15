import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Leaf } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import type { Option } from "@/components/ui/multi-select";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { getMenuItems, additionalMenuItems } from "@/data/menuData";

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

  // Main protein options (meat/seafood only - plant-based moved to vegetarian section)
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
  ];

  const WEDDING_PROTEINS = [
    // Smoked & BBQ
    { id: "applewood-herb-chicken", name: "Applewood-Smoked Herb Chicken", isPopular: true, category: "Smoked" },
    { id: "hickory-beef-brisket", name: "Hickory-Smoked Beef Brisket", isPopular: true, category: "Smoked" },
    { id: "pulled-pork-shoulder", name: "Hand-Pulled Smoked Pork Shoulder", category: "Smoked" },
    { id: "honey-glazed-ribs", name: "Honey-Glazed Ribs", category: "Smoked" },
    
    // Premium Entrées
    { id: "honey-bourbon-ham", name: "Glazed Honey-Bourbon Ham", category: "Premium" },
    { id: "lemon-honey-salmon", name: "Lemon-Honey Seared Salmon", isPremium: true, category: "Seafood" },
    { id: "cajun-turkey-wings", name: "Cajun Slow Cooked Turkey Wings", category: "Premium" },
    { id: "smothered-pork-chops", name: "Smothered Pork Chops", category: "Premium" },
    
    // Classic Southern
    { id: "buttermilk-fried-chicken", name: "Buttermilk Fried Chicken", isPopular: true, category: "Southern" },
    { id: "glazed-meatloaf", name: "Homestyle Glazed Meatloaf", category: "Southern" },
    { id: "fettuccine-alfredo", name: "Creamy Fettuccine Alfredo", category: "Pasta" },
    { id: "lowcountry-boil", name: "Signature Lowcountry Boil", isPremium: true, category: "Seafood" },
  ];

  // Vegetarian entrée options - separated from main proteins
  const REGULAR_VEGETARIAN_ENTREES: { id: string; name: string; category: string; isPremium?: boolean }[] = [
    { id: "quinoa-power-bowl", name: "Quinoa Power Bowl", category: "Plant-Based" },
    { id: "stuffed-bell-peppers", name: "Stuffed Bell Peppers", category: "Plant-Based" },
    { id: "black-bean-burgers", name: "Black Bean Burgers", category: "Plant-Based" },
    { id: "roasted-vegetable-medley", name: "Roasted Vegetable Medley", category: "Plant-Based" },
    { id: "veggie-pasta-primavera", name: "Veggie Pasta Primavera", category: "Pasta" },
    { id: "garden-stir-fry", name: "Garden Stir Fry", category: "Asian" },
  ];

  const WEDDING_VEGETARIAN_ENTREES: { id: string; name: string; category: string; isPremium?: boolean }[] = [
    { id: "vegetable-fettuccine-alfredo", name: "Creamy Vegetable Fettuccine Alfredo", isPremium: true, category: "Pasta" },
    { id: "stuffed-portobello", name: "Herb-Stuffed Portobello Mushroom", isPremium: true, category: "Elegant" },
    { id: "roasted-vegetable-medley", name: "Roasted Garden Vegetable Medley", category: "Elegant" },
    { id: "southern-veggie-plate", name: "Southern Vegetable Plate", category: "Southern" },
    { id: "honey-glazed-carrots-yams", name: "Honey-Glazed Carrots & Yams", category: "Southern" },
    { id: "caprese-stuffed-tomatoes", name: "Caprese Stuffed Heirloom Tomatoes", isPremium: true, category: "Elegant" },
  ];

  const PROTEINS = variant === 'wedding' ? WEDDING_PROTEINS : REGULAR_PROTEINS;
  const VEGETARIAN_ENTREES = variant === 'wedding' ? WEDDING_VEGETARIAN_ENTREES : REGULAR_VEGETARIAN_ENTREES;

  // Convert to MultiSelect options with formatted labels
  const proteinOptions: Option[] = PROTEINS.map(protein => {
    let label = protein.name;
    if (protein.isPopular) label += " ⭐";
    if (protein.isPremium) label += " 💎";
    
    return {
      value: protein.id,
      label: label,
      category: protein.category
    };
  });

  const vegetarianOptions: Option[] = VEGETARIAN_ENTREES.map(entree => {
    let label = entree.name;
    if (entree.isPremium) label += " 💎";
    
    return {
      value: entree.id,
      label: label,
      category: entree.category
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
                ⭐ Popular • 💎 Premium
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

      {/* VEGETARIAN SECTION - Dedicated area for vegetarian guests */}
      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-5 w-5 text-green-600" />
          <h4 className="text-base font-medium text-green-800 dark:text-green-200">
            Vegetarian Options
          </h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="guest_count_with_restrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Vegetarian Portions</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="h-12 text-base input-clean bg-background"
                    {...field}
                    onFocus={() => trackFieldInteraction('guest_count_with_restrictions')}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  How many guests need vegetarian meals?
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vegetarian_entrees"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Vegetarian Entrées</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={vegetarianOptions}
                    selected={field.value || []}
                    onChange={(value) => {
                      field.onChange(value);
                      trackFieldInteraction('vegetarian_entrees');
                    }}
                    placeholder="Select vegetarian entrées..."
                    searchPlaceholder="Search vegetarian options..."
                    maxDisplayed={2}
                    className="input-neutral bg-background"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  💎 Premium options available
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
    </div>
  );
};

export const MenuSelectionStep = MenuSelectionStepComponent;
