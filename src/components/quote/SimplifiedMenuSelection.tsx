import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { MenuItemDetails, regularMenuItems, getMenuItemsByCategory } from "@/data/menuItems";
import { CompactMenuItem } from "@/components/menu/CompactMenuItem";
import { cn } from "@/lib/utils";
import { ChefHat, Star } from "lucide-react";

interface SimplifiedMenuSelectionProps {
  form: any;
  guestCount?: number;
}

export const SimplifiedMenuSelection = ({ form, guestCount = 0 }: SimplifiedMenuSelectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('poultry');
  
  const filteredItems = getMenuItemsByCategory(regularMenuItems, selectedCategory as any);
  const primaryProtein = form.watch("primaryProtein");
  const secondaryProtein = form.watch("secondaryProtein");

  const categories = [
    { id: 'poultry', name: 'Poultry', icon: '🐔', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { id: 'beef-pork', name: 'Beef & Pork', icon: '🥩', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
    { id: 'seafood', name: 'Seafood', icon: '🐟', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { id: 'plant-based', name: 'Plant-Based', icon: '🌱', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
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

  const isProteinCategory = ['poultry', 'beef-pork', 'seafood', 'plant-based'].includes(selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-elegant font-semibold text-foreground">
          Choose Your Main Proteins
        </h3>
        <p className="text-sm text-muted-foreground">
          Select 1-2 proteins for your event. Popular items are marked with a star.
        </p>
      </div>

      {/* Mobile-First Category Selection */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
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

      {/* Simplified Menu Items */}
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
                
                {/* Selection Buttons - Mobile Optimized */}
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

      {/* Show More Button */}
      {filteredItems.length > 8 && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            View All {categories.find(c => c.id === selectedCategory)?.name} Options
          </Button>
        </div>
      )}

      {/* Custom Menu Requests */}
      <FormField
        control={form.control}
        name="customMenuRequests"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Custom Menu Requests</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Any special dishes, cooking preferences, or items not listed above..."
                className="min-h-[80px] resize-none text-base"
              />
            </FormControl>
            <FormDescription>
              Let us know about any specific requests or dietary accommodations needed.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};