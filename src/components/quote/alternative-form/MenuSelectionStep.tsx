import { useEffect, useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Leaf } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import type { Option } from "@/components/ui/multi-select";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { getMenuItems, additionalMenuItems } from "@/data/menuData";
import { VEGETARIAN_ENTREE_OPTIONS, getVegetarianEntreeLabel } from "@/data/vegetarianOptions";

interface MenuSelectionStepProps {
  form: UseFormReturn<any>;
  trackFieldInteraction: (fieldName: string) => void;
  variant?: 'regular' | 'wedding';
  /**
   * mains   → proteins + sides (required core)
   * extras  → appetizers + desserts + beverages + vegetarian options
   * full    → entire step (legacy/desktop fallback)
   */
  subStep?: 'mains' | 'extras' | 'full';
}

const REGULAR_PROTEINS = [
  { id: "fried-chicken", name: "Fried Chicken", isPopular: true, category: "Poultry" },
  { id: "bbq-chicken", name: "BBQ Chicken", isPopular: true, category: "Poultry" },
  { id: "baked-chicken", name: "Baked Chicken", category: "Poultry" },
  { id: "chicken-tenders", name: "Chicken Tenders", category: "Poultry" },
  { id: "turkey-wings", name: "Turkey Wings", category: "Poultry" },
  { id: "chicken-alfredo", name: "Chicken Alfredo", category: "Poultry" },
  { id: "chicken-wings", name: "Chicken Wings", category: "Poultry" },
  { id: "pulled-pork", name: "Pulled Pork", isPopular: true, category: "Beef & Pork" },
  { id: "brisket", name: "Beef Brisket", isPremium: true, category: "Beef & Pork" },
  { id: "ribs", name: "BBQ Ribs", isPremium: true, category: "Beef & Pork" },
  { id: "smoked-sausage", name: "Smoked Sausage", category: "Beef & Pork" },
  { id: "fried-pork-chops", name: "Fried Pork Chops", category: "Beef & Pork" },
  { id: "smothered-pork-chops", name: "Smothered Pork Chops", category: "Beef & Pork" },
  { id: "meatloaf", name: "Meatloaf", category: "Beef & Pork" },
  { id: "hamburgers", name: "Hamburgers", category: "Beef & Pork" },
  { id: "spaghetti", name: "Spaghetti", category: "Pasta" },
  { id: "lasagna", name: "Lasagna", category: "Pasta" },
  { id: "tacos", name: "Tacos", category: "Mexican" },
  { id: "catfish", name: "Fried Catfish", isPopular: true, category: "Seafood" },
  { id: "shrimp-alfredo", name: "Shrimp Alfredo", isPremium: true, category: "Seafood" },
  { id: "low-country-boil", name: "Low Country Boil", isPremium: true, category: "Seafood" },
  { id: "crabs", name: "Crabs", isPremium: true, category: "Seafood" },
  { id: "fried-fish", name: "Fried Fish", category: "Seafood" },
];

const WEDDING_PROTEINS = [
  { id: "applewood-herb-chicken", name: "Applewood-Smoked Herb Chicken", isPopular: true, category: "Smoked" },
  { id: "hickory-beef-brisket", name: "Hickory-Smoked Beef Brisket", isPopular: true, category: "Smoked" },
  { id: "pulled-pork-shoulder", name: "Hand-Pulled Smoked Pork Shoulder", category: "Smoked" },
  { id: "honey-glazed-ribs", name: "Honey-Glazed Ribs", category: "Smoked" },
  { id: "honey-bourbon-ham", name: "Glazed Honey-Bourbon Ham", category: "Premium" },
  { id: "lemon-honey-salmon", name: "Lemon-Honey Seared Salmon", isPremium: true, category: "Seafood" },
  { id: "cajun-turkey-wings", name: "Cajun Slow Cooked Turkey Wings", category: "Premium" },
  { id: "smothered-pork-chops", name: "Smothered Pork Chops", category: "Premium" },
  { id: "buttermilk-fried-chicken", name: "Buttermilk Fried Chicken", isPopular: true, category: "Southern" },
  { id: "glazed-meatloaf", name: "Homestyle Glazed Meatloaf", category: "Southern" },
  { id: "fettuccine-alfredo", name: "Creamy Fettuccine Alfredo", category: "Pasta" },
  { id: "lowcountry-boil", name: "Signature Lowcountry Boil", isPremium: true, category: "Seafood" },
];

/** Compact summary chip strip — gives users a "you have X selected" anchor while scrolling */
const SelectionSummary = ({ items }: { items: Array<{ label: string; count: number }> }) => {
  const visible = items.filter((i) => i.count > 0);
  if (visible.length === 0) return null;
  return (
    <div
      className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border/60 flex flex-wrap gap-1.5"
      aria-label="Current menu selections"
    >
      {visible.map((i) => (
        <Badge
          key={i.label}
          variant="secondary"
          className="text-[11px] font-medium px-2 py-0.5"
        >
          ✓ {i.count} {i.label}
        </Badge>
      ))}
    </div>
  );
};

const MenuSelectionStepComponent = ({
  form,
  trackFieldInteraction,
  variant = 'regular',
  subStep = 'full',
}: MenuSelectionStepProps) => {
  const { ref, isVisible, variant: animVariant } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100,
  });

  const animationClass = useAnimationClass(animVariant, isVisible);

  const menuItems = getMenuItems(variant);
  const ADDITIONAL_ITEMS = additionalMenuItems;

  const PROTEINS = variant === 'wedding' ? WEDDING_PROTEINS : REGULAR_PROTEINS;
  const vegetarianOptions: Option[] = VEGETARIAN_ENTREE_OPTIONS.map((item) => ({
    value: item.id,
    label: getVegetarianEntreeLabel(item.id, variant),
    category: "Vegetarian",
  }));

  // Cross-field validation: require entree selection when vegetarian portions > 0
  const watchedPortions = useWatch({ control: form.control, name: 'guest_count_with_restrictions' });
  const watchedEntrees = useWatch({ control: form.control, name: 'vegetarian_entrees' });

  // Watched values for the summary chip strip
  const wProteins = useWatch({ control: form.control, name: 'proteins' }) || [];
  const wSides = useWatch({ control: form.control, name: 'sides' }) || [];
  const wAppetizers = useWatch({ control: form.control, name: 'appetizers' }) || [];
  const wDesserts = useWatch({ control: form.control, name: 'desserts' }) || [];
  const wDrinks = useWatch({ control: form.control, name: 'drinks' }) || [];
  const wVeg = useWatch({ control: form.control, name: 'vegetarian_entrees' }) || [];

  useEffect(() => {
    const portionCount = parseInt(watchedPortions || '0', 10);
    const hasEntrees = Array.isArray(watchedEntrees) && watchedEntrees.length > 0;

    if (portionCount > 0 && !hasEntrees) {
      form.setError('vegetarian_entrees', {
        type: 'manual',
        message: 'Please select at least one vegetarian entrée for your vegetarian guests.',
      });
    } else {
      form.clearErrors('vegetarian_entrees');
    }

    if (hasEntrees && (portionCount <= 0 || !watchedPortions)) {
      form.setError('guest_count_with_restrictions', {
        type: 'manual',
        message: 'Please enter the number of vegetarian portions.',
      });
    } else {
      form.clearErrors('guest_count_with_restrictions');
    }
  }, [watchedPortions, watchedEntrees, form]);

  const proteinOptions: Option[] = PROTEINS.map((protein) => {
    let label = protein.name;
    if (protein.isPopular) label += " ⭐";
    if (protein.isPremium) label += " 💎";
    return { value: protein.id, label, category: protein.category };
  });

  const appetizerOptions: Option[] = menuItems.appetizers.map((app) => ({
    value: app.id, label: app.name, category: "Appetizers",
  }));

  const sidesOptions: Option[] = menuItems.sides.map((side) => ({
    value: side.id, label: side.name, category: "Sides",
  }));

  const dessertOptions: Option[] = menuItems.desserts.map((dessert) => ({
    value: dessert.id, label: dessert.name, category: "Desserts",
  }));

  const drinkOptions: Option[] = ADDITIONAL_ITEMS.drinks.map((drink) => ({
    value: drink.id, label: drink.name, category: "Beverages",
  }));

  // Summary chips per sub-step
  const mainsSummary = useMemo(
    () => [
      { label: wProteins.length === 1 ? 'Protein' : 'Proteins', count: wProteins.length },
      { label: wSides.length === 1 ? 'Side' : 'Sides', count: wSides.length },
      { label: wVeg.length === 1 ? 'Veg entrée' : 'Veg entrées', count: wVeg.length },
    ],
    [wProteins.length, wSides.length, wVeg.length]
  );

  const extrasSummary = useMemo(
    () => [
      { label: wAppetizers.length === 1 ? 'Appetizer' : 'Appetizers', count: wAppetizers.length },
      { label: wDesserts.length === 1 ? 'Dessert' : 'Desserts', count: wDesserts.length },
      { label: wDrinks.length === 1 ? 'Beverage' : 'Beverages', count: wDrinks.length },
    ],
    [wAppetizers.length, wDesserts.length, wDrinks.length]
  );

  const showMains = subStep === 'mains' || subStep === 'full';
  const showExtras = subStep === 'extras' || subStep === 'full';

  const BothProteinsToggle = (
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
  );

  return (
    <div ref={ref} className={`space-y-6 ${animationClass}`}>
      {showMains && (
        <>
          <SelectionSummary items={mainsSummary} />
          {BothProteinsToggle}

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
        </>
      )}

      {showExtras && (
        <>
          <SelectionSummary items={extrasSummary} />

          {/* VEGETARIAN SECTION */}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Appetizers + Desserts + Beverages */}
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
        </>
      )}
    </div>
  );
};

export const MenuSelectionStep = MenuSelectionStepComponent;
