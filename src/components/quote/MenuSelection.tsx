
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { MenuItemDetails, regularMenuItems, weddingMenuItems, getMenuItemsByCategory } from "@/data/menuItems";
import { cn } from "@/lib/utils";
import { Clock, Users, Utensils, ChefHat } from "lucide-react";

interface MenuSelectionProps {
  form: any;
  eventType: 'regular' | 'wedding';
  guestCount?: number;
}

export const MenuSelection = ({ form, eventType, guestCount = 0 }: MenuSelectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('poultry');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  
  const menuItems = eventType === 'wedding' ? weddingMenuItems : regularMenuItems;
  const filteredItems = getMenuItemsByCategory(menuItems, selectedCategory as any);
  
  const primaryProtein = form.watch("primaryProtein");
  const secondaryProtein = form.watch("secondaryProtein");
  const bothProteinsAvailable = form.watch("bothProteinsAvailable");

  const categories = [
    { id: 'poultry', name: 'Poultry', icon: '🐔' },
    { id: 'beef-pork', name: 'Beef & Pork', icon: '🥩' },
    { id: 'seafood', name: 'Seafood', icon: '🐟' },
    { id: 'plant-based', name: 'Plant-Based', icon: '🌱' }
  ];

  const dietaryOptions = [
    'Gluten-Free',
    'Dairy-Free', 
    'Vegetarian',
    'No Shellfish',
    'No Nuts'
  ];

  const isItemSelectable = (item: MenuItemDetails) => {
    if (item.minimumGuests && guestCount > 0 && guestCount < item.minimumGuests) {
      return false;
    }
    return true;
  };

  const getItemWarnings = (item: MenuItemDetails) => {
    const warnings = [];
    if (item.minimumGuests && guestCount > 0 && guestCount < item.minimumGuests) {
      warnings.push(`Minimum ${item.minimumGuests} guests required`);
    }
    if (item.leadTimeHours && item.leadTimeHours > 48) {
      warnings.push(`Requires ${item.leadTimeHours}+ hours advance notice`);
    }
    if (item.seasonal) {
      warnings.push('Seasonal availability');
    }
    return warnings;
  };

  const handleProteinSelection = (itemId: string, isPrimary: boolean) => {
    if (isPrimary) {
      form.setValue("primaryProtein", itemId);
      // Clear secondary if same as primary
      if (secondaryProtein === itemId) {
        form.setValue("secondaryProtein", "");
      }
    } else {
      if (primaryProtein === itemId) {
        return; // Can't select same item as both
      }
      form.setValue("secondaryProtein", itemId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-elegant font-semibold text-foreground mb-2">
          Select Your Proteins
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose up to 2 proteins for your event. Guests can select between options or you can offer both.
        </p>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="text-xs"
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Dietary Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Dietary Considerations</Label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`dietary-${option}`}
                checked={dietaryFilters.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setDietaryFilters([...dietaryFilters, option]);
                  } else {
                    setDietaryFilters(dietaryFilters.filter(f => f !== option));
                  }
                }}
              />
              <Label htmlFor={`dietary-${option}`} className="text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isSelected = primaryProtein === item.id || secondaryProtein === item.id;
          const isPrimary = primaryProtein === item.id;
          const isSecondary = secondaryProtein === item.id;
          const canSelect = isItemSelectable(item);
          const warnings = getItemWarnings(item);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary bg-primary/5",
                !canSelect && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium leading-tight">
                    {item.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    {item.popularity === 'high' && (
                      <Badge variant="secondary" className="text-xs">
                        <ChefHat className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {item.seasonal && (
                      <Badge variant="outline" className="text-xs">
                        Seasonal
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {/* Dietary Info */}
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryInfo.map((info) => (
                      <Badge key={info} variant="outline" className="text-xs">
                        {info}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Requirements */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.minimumGuests && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Min {item.minimumGuests}
                      </div>
                    )}
                    {item.leadTimeHours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.leadTimeHours}h notice
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      {item.servingStyle.join(', ')}
                    </div>
                  </div>

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <div className="text-xs text-destructive">
                      {warnings.join(' • ')}
                    </div>
                  )}
                </div>

                {/* Selection Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isPrimary ? "default" : "outline"}
                    disabled={!canSelect || (secondaryProtein === item.id)}
                    onClick={() => handleProteinSelection(item.id, true)}
                    className="flex-1"
                  >
                    {isPrimary ? "Primary Protein" : "Select as Primary"}
                  </Button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant={isSecondary ? "default" : "outline"}
                    disabled={!canSelect || !primaryProtein || primaryProtein === item.id}
                    onClick={() => handleProteinSelection(item.id, false)}
                    className="flex-1"
                  >
                    {isSecondary ? "Secondary Protein" : "Add as Secondary"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 pt-4 border-t">
        <FormField
          control={form.control}
          name="bothProteinsAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!primaryProtein || !secondaryProtein}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Offer Both Proteins to Guests
                </FormLabel>
                <FormDescription>
                  Allow guests to choose between both selected proteins (requires both selections above)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customMenuRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Menu Requests</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any special menu modifications, cooking preferences, or items not listed above..."
                  className="min-h-[80px] resize-none"
                />
              </FormControl>
              <FormDescription>
                Let us know about any specific cooking requests, sauce preferences, or menu items you'd like that aren't listed above.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Dietary Restrictions</FormLabel>
              <FormDescription>
                Please list any food allergies, vegetarian/vegan guests, or special dietary needs.
              </FormDescription>
              <FormControl>
                <Textarea
                  value={field.value?.join(', ') || ''}
                  onChange={(e) => field.onChange(e.target.value.split(', ').filter(Boolean))}
                  placeholder="e.g., 3 guests gluten-free, 2 vegetarian, 1 nut allergy..."
                  className="min-h-[60px] resize-none"
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
