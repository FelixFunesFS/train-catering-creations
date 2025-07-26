import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { MenuItemDetails, regularMenuItems, getMenuItemsByCategory } from "@/data/menuItems";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuSelectionProps {
  form: any;
  guestCount?: number;
}

export const MobileMenuSelection = ({ form, guestCount = 0 }: MobileMenuSelectionProps) => {
  const [currentSection, setCurrentSection] = useState<'proteins' | 'sides' | 'extras'>('proteins');
  const [selectedProteinCategory, setSelectedProteinCategory] = useState<'poultry' | 'beef-pork' | 'seafood'>('poultry');
  
  const primaryProtein = form.watch("primaryProtein");
  const secondaryProtein = form.watch("secondaryProtein");
  const bothProteinsAvailable = form.watch("bothProteinsAvailable");
  const selectedAppetizers = form.watch("selectedAppetizers") || [];
  const selectedSides = form.watch("selectedSides") || [];
  const selectedDesserts = form.watch("selectedDesserts") || [];
  const selectedDrinks = form.watch("selectedDrinks") || [];

  const proteinCategories = [
    { id: 'poultry', name: 'Poultry', icon: '🐔' },
    { id: 'beef-pork', name: 'Beef & Pork', icon: '🥩' },
    { id: 'seafood', name: 'Seafood', icon: '🐟' }
  ];

  const isItemSelectable = (item: MenuItemDetails): boolean => {
    return !item.minimumGuests || guestCount >= item.minimumGuests;
  };

  const handleProteinSelection = (itemId: string, isPrimary: boolean) => {
    if (isPrimary) {
      form.setValue("primaryProtein", itemId);
      // Clear secondary if same as primary
      if (secondaryProtein === itemId) {
        form.setValue("secondaryProtein", "");
      }
    } else {
      if (itemId === primaryProtein) return; // Can't select same as primary
      form.setValue("secondaryProtein", itemId);
    }
  };

  const popularSides = [
    { id: 'mac-cheese', name: 'Mac & Cheese', description: 'Creamy comfort classic' },
    { id: 'green-beans', name: 'Green Beans', description: 'Fresh seasoned vegetables' },
    { id: 'cornbread', name: 'Cornbread', description: 'Sweet homemade cornbread' },
    { id: 'potato-salad', name: 'Potato Salad', description: 'Traditional recipe' }
  ];

  const essentialExtras = [
    { id: 'plates', name: 'Disposable Plates', category: 'utensils' },
    { id: 'cups', name: 'Disposable Cups', category: 'utensils' },
    { id: 'napkins', name: 'Napkins', category: 'utensils' },
    { id: 'utensils', name: 'Plastic Utensils', category: 'utensils' },
    { id: 'sweet-tea', name: 'Sweet Tea', category: 'drinks' },
    { id: 'lemonade', name: 'Fresh Lemonade', category: 'drinks' },
    { id: 'water', name: 'Bottled Water', category: 'drinks' },
    { id: 'soda', name: 'Assorted Sodas', category: 'drinks' }
  ];

  const renderProteinTable = () => {
    const proteins = getMenuItemsByCategory(regularMenuItems, selectedProteinCategory);
    
    return (
      <div className="space-y-4">
        {/* Category Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {proteinCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedProteinCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProteinCategory(category.id as any)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Protein Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 border-b">
            <h4 className="font-medium">Select Your Primary Protein</h4>
            <p className="text-sm text-muted-foreground">Choose one main protein for your event</p>
          </div>
          
          <div className="space-y-0">
            {proteins.map((protein) => {
              const isSelectable = isItemSelectable(protein);
              const isSelected = primaryProtein === protein.id;
              
              return (
                <div
                  key={protein.id}
                  className={cn(
                    "flex items-center gap-3 p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50",
                    isSelected && "bg-primary/5 border-primary/20",
                    !isSelectable && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => isSelectable && handleProteinSelection(protein.id, true)}
                >
                  <RadioGroupItem
                    value={protein.id}
                    checked={isSelected}
                    disabled={!isSelectable}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{protein.name}</h5>
                      {protein.popularity === 'high' && (
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{protein.description}</p>
                    {protein.minimumGuests && (
                      <p className="text-xs text-muted-foreground">Min: {protein.minimumGuests} guests</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Protein Option */}
        {primaryProtein && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <FormField
              control={form.control}
              name="bothProteinsAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Offer a second protein option to guests
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Give guests choice between two proteins
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {bothProteinsAvailable && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Second Protein</Label>
                <div className="grid gap-2">
                  {proteins
                    .filter(p => p.id !== primaryProtein && isItemSelectable(p))
                    .slice(0, 3)
                    .map((protein) => (
                      <Button
                        key={protein.id}
                        variant={secondaryProtein === protein.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleProteinSelection(protein.id, false)}
                        className="justify-start text-left h-auto p-3"
                      >
                        <div>
                          <div className="font-medium text-sm">{protein.name}</div>
                          <div className="text-xs opacity-70">{protein.description}</div>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSidesSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h4 className="font-medium">Popular Side Dishes</h4>
        <p className="text-sm text-muted-foreground">Select 2-4 sides (recommended)</p>
      </div>

      <div className="grid gap-3">
        {popularSides.map((side) => {
          const isSelected = selectedSides.includes(side.id);
          
          return (
            <div
              key={side.id}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50",
                isSelected && "bg-primary/5 border-primary/20"
              )}
              onClick={() => {
                const newSides = isSelected
                  ? selectedSides.filter((id: string) => id !== side.id)
                  : [...selectedSides, side.id];
                form.setValue("selectedSides", newSides);
              }}
            >
              <Checkbox checked={isSelected} />
              <div className="flex-1">
                <h5 className="font-medium text-sm">{side.name}</h5>
                <p className="text-xs text-muted-foreground">{side.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appetizers */}
      <div className="pt-4 border-t">
        <h5 className="font-medium text-sm mb-3">Add Appetizers? (Optional)</h5>
        <div className="grid grid-cols-2 gap-2">
          {['Wings', 'Deviled Eggs', 'Cheese & Crackers', 'Fruit Tray'].map((appetizer, index) => {
            const id = `appetizer-${index}`;
            const isSelected = selectedAppetizers.includes(id);
            
            return (
              <Button
                key={id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newAppetizers = isSelected
                    ? selectedAppetizers.filter((aid: string) => aid !== id)
                    : [...selectedAppetizers, id];
                  form.setValue("selectedAppetizers", newAppetizers);
                }}
                className="h-auto p-3 text-xs"
              >
                {appetizer}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderExtrasSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h4 className="font-medium">Service Items & Beverages</h4>
        <p className="text-sm text-muted-foreground">Essential items for your event</p>
      </div>

      <div className="space-y-4">
        {/* Utensils & Service Items */}
        <div>
          <h5 className="font-medium text-sm mb-3">Service Items</h5>
          <div className="grid grid-cols-2 gap-2">
            {essentialExtras
              .filter(item => item.category === 'utensils')
              .map((item) => {
                const selectedUtensils = form.watch("selectedUtensils") || [];
                const isSelected = selectedUtensils.includes(item.id);
                
                return (
                  <Button
                    key={item.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newUtensils = isSelected
                        ? selectedUtensils.filter((id: string) => id !== item.id)
                        : [...selectedUtensils, item.id];
                      form.setValue("selectedUtensils", newUtensils);
                    }}
                    className="h-auto p-3 text-xs"
                  >
                    {item.name}
                  </Button>
                );
              })}
          </div>
        </div>

        {/* Beverages */}
        <div>
          <h5 className="font-medium text-sm mb-3">Beverages</h5>
          <div className="grid grid-cols-2 gap-2">
            {essentialExtras
              .filter(item => item.category === 'drinks')
              .map((item) => {
                const isSelected = selectedDrinks.includes(item.id);
                
                return (
                  <Button
                    key={item.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newDrinks = isSelected
                        ? selectedDrinks.filter((id: string) => id !== item.id)
                        : [...selectedDrinks, item.id];
                      form.setValue("selectedDrinks", newDrinks);
                    }}
                    className="h-auto p-3 text-xs"
                  >
                    {item.name}
                  </Button>
                );
              })}
          </div>
        </div>

        {/* Desserts */}
        <div>
          <h5 className="font-medium text-sm mb-3">Desserts (Optional)</h5>
          <div className="grid grid-cols-2 gap-2">
            {['Peach Cobbler', 'Banana Pudding', 'Pound Cake', 'Cookies'].map((dessert, index) => {
              const id = `dessert-${index}`;
              const isSelected = selectedDesserts.includes(id);
              
              return (
                <Button
                  key={id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newDesserts = isSelected
                      ? selectedDesserts.filter((did: string) => did !== id)
                      : [...selectedDesserts, id];
                    form.setValue("selectedDesserts", newDesserts);
                  }}
                  className="h-auto p-3 text-xs"
                >
                  {dessert}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Requests */}
      <div className="pt-4 border-t">
        <FormField
          control={form.control}
          name="customMenuRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Special Menu Requests</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any dietary restrictions, special preparations, or custom requests..."
                  className="min-h-20 text-sm"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Include any allergies, dietary restrictions, or special menu modifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const sections = [
    { id: 'proteins', name: 'Proteins', description: 'Choose main course' },
    { id: 'sides', name: 'Sides & Apps', description: 'Select accompaniments' },
    { id: 'extras', name: 'Service & Drinks', description: 'Essential items' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-elegant font-semibold">Menu Selection</h3>
        <p className="text-muted-foreground">Build your perfect menu in 3 simple steps</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={cn(
              "flex flex-col items-center flex-1 cursor-pointer",
              currentSection === section.id && "text-primary"
            )}
            onClick={() => setCurrentSection(section.id as any)}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium mb-1",
                currentSection === section.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{section.name}</div>
              <div className="text-xs text-muted-foreground hidden sm:block">{section.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Content */}
      <div className="min-h-[400px]">
        {currentSection === 'proteins' && renderProteinTable()}
        {currentSection === 'sides' && renderSidesSelection()}
        {currentSection === 'extras' && renderExtrasSelection()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => {
            const currentIndex = sections.findIndex(s => s.id === currentSection);
            if (currentIndex > 0) {
              setCurrentSection(sections[currentIndex - 1].id as any);
            }
          }}
          disabled={currentSection === 'proteins'}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={() => {
            const currentIndex = sections.findIndex(s => s.id === currentSection);
            if (currentIndex < sections.length - 1) {
              setCurrentSection(sections[currentIndex + 1].id as any);
            }
          }}
          disabled={currentSection === 'extras'}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};