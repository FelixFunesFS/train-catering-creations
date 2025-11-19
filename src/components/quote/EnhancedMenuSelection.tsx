import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { MenuItemDetails, regularMenuItems, getMenuItemsByCategory } from "@/data/menuItems";
import { cn } from "@/lib/utils";
import { ChefHat, Star, Utensils, Coffee, Cherry, Cake } from "lucide-react";

interface EnhancedMenuSelectionProps {
  form: any;
  guestCount?: number;
}

// Additional menu items for drinks, utensils, and extras
const drinkOptions = [
  { id: 'sweet-tea', name: 'Sweet Tea', description: 'Southern-style sweet iced tea' },
  { id: 'lemonade', name: 'Fresh Lemonade', description: 'Made with fresh lemons' },
  { id: 'water', name: 'Bottled Water', description: 'Individual water bottles' },
  { id: 'soft-drinks', name: 'Soft Drinks', description: 'Assorted sodas and beverages' },
  { id: 'coffee', name: 'Coffee Service', description: 'Hot coffee with cream and sugar' },
  { id: 'punch', name: 'Fruit Punch', description: 'Refreshing fruit punch' },
];

const utensilOptions = [
  { id: 'plastic-utensils', name: 'Plastic Utensils', description: 'Disposable forks, knives, spoons' },
  { id: 'real-utensils', name: 'Real Utensils', description: 'Stainless steel cutlery (additional fee)' },
  { id: 'serving-utensils', name: 'Serving Utensils', description: 'For buffet-style serving' },
];

const extraOptions = [
  { id: 'disposable-plates', name: 'Disposable Plates', description: 'Paper or plastic plates' },
  { id: 'real-plates', name: 'Real Plates', description: 'Ceramic plates (additional fee)' },
  { id: 'napkins', name: 'Napkins', description: 'Paper napkins' },
  { id: 'tablecloths', name: 'Tablecloths', description: 'Disposable table coverings' },
  { id: 'chafing-dishes', name: 'Chafing Dishes', description: 'Keep food warm during service' },
  { id: 'ice-setup', name: 'Ice & Coolers', description: 'Ice and cooling setup for drinks' },
];

export const EnhancedMenuSelection = ({ form, guestCount = 0 }: EnhancedMenuSelectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('poultry');
  const [activeSection, setActiveSection] = useState<string>('proteins');
  
  const filteredItems = getMenuItemsByCategory(regularMenuItems, selectedCategory as any);
  const primaryProtein = form.watch("primaryProtein");
  const secondaryProtein = form.watch("secondaryProtein");
  const selectedAppetizers = form.watch("selectedAppetizers") || [];
  const selectedSides = form.watch("selectedSides") || [];
  const selectedDesserts = form.watch("selectedDesserts") || [];
  const selectedDrinks = form.watch("selectedDrinks") || [];
  const selectedUtensils = form.watch("selectedUtensils") || [];
  const selectedExtras = form.watch("selectedExtras") || [];

  const proteinCategories = [
    { id: 'poultry', name: 'Poultry', icon: '🐔', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { id: 'beef-pork', name: 'Beef & Pork', icon: '🥩', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
    { id: 'seafood', name: 'Seafood', icon: '🐟', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { id: 'plant-based', name: 'Plant-Based', icon: '🌱', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  ];

  const menuSections = [
    { id: 'proteins', name: 'Main Proteins', icon: ChefHat, description: 'Choose 1-2 main dishes' },
    { id: 'appetizers', name: 'Appetizers', icon: Cherry, description: 'Optional starters' },
    { id: 'sides', name: 'Side Dishes', icon: Utensils, description: 'Complement your meal' },
    { id: 'desserts', name: 'Desserts', icon: Cake, description: 'Sweet endings' },
    { id: 'drinks', name: 'Beverages', icon: Coffee, description: 'Refresh your guests' },
    { id: 'extras', name: 'Utensils & Extras', icon: Utensils, description: 'Service essentials' },
  ];

  const isItemSelectable = (item: MenuItemDetails) => {
    if (item.minimumGuests && guestCount > 0 && guestCount < item.minimumGuests) {
      return false;
    }
    return true;
  };

  const handleProteinSelection = (itemId: string, isPrimary: boolean) => {
    if (isPrimary) {
      form.setValue("primaryProtein", itemId);
      if (secondaryProtein === itemId) {
        form.setValue("secondaryProtein", "");
      }
    } else {
      if (primaryProtein === itemId) {
        return;
      }
      form.setValue("secondaryProtein", itemId);
    }
  };

  const handleItemSelection = (itemId: string, category: 'appetizers' | 'sides' | 'desserts' | 'drinks' | 'utensils' | 'extras') => {
    const fieldName = `selected${category.charAt(0).toUpperCase() + category.slice(1)}` as const;
    const currentSelection = form.watch(fieldName) || [];
    
    if (currentSelection.includes(itemId)) {
      form.setValue(fieldName, currentSelection.filter((id: string) => id !== itemId));
    } else {
      form.setValue(fieldName, [...currentSelection, itemId]);
    }
  };

  const renderProteinSection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-elegant font-semibold text-foreground">
          Choose Your Main Proteins
        </h3>
        <p className="text-sm text-muted-foreground">
          Select 1-2 proteins for your event. Popular items are marked with a star.
        </p>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 gap-3">
        {proteinCategories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2 text-left transition-all duration-200",
              selectedCategory === category.id 
                ? "ring-2 ring-primary bg-primary/5 border-primary" 
                : category.color
            )}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-sm font-medium leading-tight">{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {filteredItems.slice(0, 8).map((item) => {
          const isSelected = primaryProtein === item.id || secondaryProtein === item.id;
          const isPrimary = primaryProtein === item.id;
          const isSecondary = secondaryProtein === item.id;
          const canSelect = isItemSelectable(item);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-sm",
                isSelected && "ring-2 ring-primary bg-primary/5 border-primary",
                !canSelect && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground leading-tight">
                        {item.name}
                      </h4>
                      {item.popularity === 'high' && (
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isPrimary ? "default" : "outline"}
                    disabled={!canSelect || (secondaryProtein === item.id)}
                    onClick={() => handleProteinSelection(item.id, true)}
                    className="flex-1 h-9"
                  >
                    {isPrimary ? "✓ Primary" : "Primary"}
                  </Button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant={isSecondary ? "default" : "outline"}
                    disabled={!canSelect || !primaryProtein || primaryProtein === item.id}
                    onClick={() => handleProteinSelection(item.id, false)}
                    className="flex-1 h-9"
                  >
                    {isSecondary ? "✓ Secondary" : "Secondary"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderMenuItemsGrid = (category: 'appetizers' | 'sides' | 'desserts', selectedItems: string[]) => {
    const items = getMenuItemsByCategory(regularMenuItems, category);
    
    return (
      <div className="grid gap-3">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          const canSelect = isItemSelectable(item);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-sm",
                isSelected && "ring-2 ring-primary bg-primary/5 border-primary",
                !canSelect && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => canSelect && handleItemSelection(item.id, category)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground leading-tight">
                        {item.name}
                      </h4>
                      {item.popularity === 'high' && (
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-2">
                    <Checkbox
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={() => canSelect && handleItemSelection(item.id, category)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDrinksAndExtras = (options: any[], selectedItems: string[], category: 'drinks' | 'utensils' | 'extras') => (
    <div className="grid gap-3">
      {options.map((option) => {
        const isSelected = selectedItems.includes(option.id);
        
        return (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-sm",
              isSelected && "ring-2 ring-primary bg-primary/5 border-primary"
            )}
            onClick={() => handleItemSelection(option.id, category)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground leading-tight mb-1">
                    {option.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <div className="ml-2">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleItemSelection(option.id, category)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'proteins':
        return renderProteinSection();
      
      case 'appetizers':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-elegant font-semibold">Appetizers & Starters</h3>
              <p className="text-sm text-muted-foreground">Optional appetizers to start your event</p>
            </div>
            {renderMenuItemsGrid('appetizers', selectedAppetizers)}
          </div>
        );
      
      case 'sides':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-elegant font-semibold">Side Dishes</h3>
              <p className="text-sm text-muted-foreground">Perfect complements to your main dishes</p>
            </div>
            {renderMenuItemsGrid('sides', selectedSides)}
          </div>
        );
      
      case 'desserts':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-elegant font-semibold">Desserts</h3>
              <p className="text-sm text-muted-foreground">Sweet endings to your special event</p>
            </div>
            {renderMenuItemsGrid('desserts', selectedDesserts)}
          </div>
        );
      
      case 'drinks':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-elegant font-semibold">Beverages</h3>
              <p className="text-sm text-muted-foreground">Keep your guests refreshed</p>
            </div>
            {renderDrinksAndExtras(drinkOptions, selectedDrinks, 'drinks')}
          </div>
        );
      
      case 'extras':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-elegant font-semibold">Utensils & Extras</h3>
              <p className="text-sm text-muted-foreground">Essential items for your event service</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Utensils</h4>
                {renderDrinksAndExtras(utensilOptions, selectedUtensils, 'utensils')}
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Additional Items</h4>
                {renderDrinksAndExtras(extraOptions, selectedExtras, 'extras')}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {menuSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const hasSelections = (() => {
            switch (section.id) {
              case 'proteins': return primaryProtein;
              case 'appetizers': return selectedAppetizers.length > 0;
              case 'sides': return selectedSides.length > 0;
              case 'desserts': return selectedDesserts.length > 0;
              case 'drinks': return selectedDrinks.length > 0;
              case 'extras': return selectedUtensils.length > 0 || selectedExtras.length > 0;
              default: return false;
            }
          })();
          
          return (
            <Button
              key={section.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "h-auto p-3 flex flex-col items-center gap-1 text-center transition-all duration-200 relative",
                isActive 
                  ? "ring-2 ring-primary bg-primary/5 border-primary" 
                  : "hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium leading-tight">{section.name}</span>
              {hasSelections && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  ✓
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="min-h-[400px]">
        {renderSectionContent()}
      </div>

      {/* Custom Menu Requests */}
      <FormField
        control={form.control}
        name="customMenuRequests"
        render={({ field }) => (
          <FormItem className="pt-4 border-t">
            <FormLabel className="text-base font-medium">Custom Menu Requests & Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Any special dishes, cooking preferences, dietary accommodations, or items not listed above..."
                className="min-h-[80px] resize-none text-base"
              />
            </FormControl>
            <FormDescription>
              Let us know about any specific requests, allergies, or dietary accommodations needed.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};