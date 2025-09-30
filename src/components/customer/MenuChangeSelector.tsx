import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Plus,
  UtensilsCrossed,
  Cookie,
  Coffee,
  CheckCircle,
  Edit,
  Minus,
  ShoppingCart,
  ChefHat,
  Sparkles,
  AlertCircle,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMenuItems, additionalMenuItems, menuData } from '@/data/menuData';

// Get complete menu options from menuData
const allMenuItems = getMenuItems();

// Create ID to Name mapping for display
const createIdToNameMap = () => {
  const map: { [id: string]: string } = {};
  
  // Add all menu items from main categories
  Object.values(allMenuItems).forEach(items => {
    items.forEach(item => {
      map[item.id] = item.name;
    });
  });
  
  // Add drinks
  additionalMenuItems.drinks.forEach(drink => {
    map[drink.id] = drink.name;
  });
  
  return map;
};

const ID_TO_NAME = createIdToNameMap();

// Helper to convert name to ID (for backward compatibility)
const nameToId = (name: string): string => {
  // First check if it's already an ID
  if (ID_TO_NAME[name]) return name;
  // Otherwise convert name to ID
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
};

// Helper to get display name from ID or name
const getDisplayName = (idOrName: string): string => {
  return ID_TO_NAME[idOrName] || idOrName;
};

// Complete menu options organized by category with popularity flags
const MENU_OPTIONS = {
  appetizers: allMenuItems.appetizers.map(item => ({ id: item.id, name: item.name, isPopular: item.isPopular, isVegetarian: item.isVegetarian })),
  sides: allMenuItems.sides.map(item => ({ id: item.id, name: item.name, isPopular: item.isPopular, isVegetarian: item.isVegetarian })),
  desserts: allMenuItems.desserts.map(item => ({ id: item.id, name: item.name, isPopular: item.isPopular, isVegetarian: item.isVegetarian })),
  drinks: additionalMenuItems.drinks.map(drink => ({ id: drink.id, name: drink.name, isPopular: drink.isPopular })),
  proteins: allMenuItems.entrees.map(item => ({ id: item.id, name: item.name, isPopular: item.isPopular, isVegetarian: item.isVegetarian }))
};

interface MenuChangeSelectorProps {
  quote: any;
  onChange: (changes: any) => void;
}

export function MenuChangeSelector({ quote, onChange }: MenuChangeSelectorProps) {
  const [menuChanges, setMenuChanges] = useState<any>({
    proteins: { remove: [], add: [], substitute: {} },
    appetizers: { remove: [], add: [], substitute: {} },
    sides: { remove: [], add: [], substitute: {} },
    desserts: { remove: [], add: [], substitute: {} },
    drinks: { remove: [], add: [], substitute: {} },
    dietary_restrictions: { add: [] },
    service_options: {},
    custom_requests: ''
  });
  const [activeTab, setActiveTab] = useState('remove');

  // Helper function to safely parse and format array fields
  const formatArrayField = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Handle comma-separated strings
        return field.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Helper to parse proteins (handles comma-separated strings)
  const parseProteins = (proteinField: any): string[] => {
    if (!proteinField) return [];
    if (typeof proteinField === 'string') {
      return proteinField.split(',').map(p => p.trim()).filter(Boolean);
    }
    return [];
  };

  // Get individual proteins from primary and secondary fields
  const primaryProteins = parseProteins(quote.primary_protein);
  const secondaryProteins = parseProteins(quote.secondary_protein);
  const allProteins = [...primaryProteins, ...secondaryProteins];

  // Format quote data for display
  const currentAppetizers = formatArrayField(quote.appetizers);
  const currentSides = formatArrayField(quote.sides);
  const currentDesserts = formatArrayField(quote.desserts);
  const currentDrinks = formatArrayField(quote.drinks);

  const handleToggleRemove = (category: string, item: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      const removeList = updated[category].remove || [];
      
      // Normalize to ID format
      const itemId = nameToId(item);
      
      if (removeList.includes(itemId)) {
        updated[category].remove = removeList.filter((i: string) => i !== itemId);
      } else {
        updated[category].remove = [...removeList, itemId];
      }
      
      onChange(updated);
      return updated;
    });
  };

  const handleAddItem = (category: string, itemId: string) => {
    if (!itemId) return;
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      const addList = updated[category].add || [];
      
      if (!addList.includes(itemId)) {
        updated[category].add = [...addList, itemId];
      }
      
      onChange(updated);
      return updated;
    });
  };

  const handleRemoveAddition = (category: string, itemId: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      updated[category].add = (updated[category].add || []).filter((i: string) => i !== itemId);
      onChange(updated);
      return updated;
    });
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setMenuChanges((prev: any) => {
      const updated = {
        ...prev,
        service_options: {
          ...prev.service_options,
          [service]: checked
        }
      };
      onChange(updated);
      return updated;
    });
  };

  const handleCustomRequestChange = (value: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev, custom_requests: value };
      onChange(updated);
      return updated;
    });
  };

  const hasChanges = () => {
    return (
      menuChanges.proteins.remove.length > 0 ||
      menuChanges.proteins.add.length > 0 ||
      menuChanges.appetizers.remove.length > 0 ||
      menuChanges.appetizers.add.length > 0 ||
      menuChanges.sides.remove.length > 0 ||
      menuChanges.sides.add.length > 0 ||
      menuChanges.desserts.remove.length > 0 ||
      menuChanges.desserts.add.length > 0 ||
      menuChanges.drinks.remove.length > 0 ||
      menuChanges.drinks.add.length > 0 ||
      Object.keys(menuChanges.service_options).length > 0 ||
      menuChanges.custom_requests.trim().length > 0
    );
  };

  // Get available items (not already in quote or added) - returns objects with id, name, and metadata
  const getAvailableItems = (category: string): Array<{id: string, name: string, isPopular?: boolean, isVegetarian?: boolean}> => {
    const categoryKey = category.toLowerCase() as keyof typeof MENU_OPTIONS;
    const allItems = MENU_OPTIONS[categoryKey] || [];
    
    // Get current quote items (normalize to IDs)
    let currentItems: string[] = [];
    if (category === 'appetizers') currentItems = currentAppetizers.map(item => nameToId(item));
    else if (category === 'sides') currentItems = currentSides.map(item => nameToId(item));
    else if (category === 'desserts') currentItems = currentDesserts.map(item => nameToId(item));
    else if (category === 'drinks') currentItems = currentDrinks.map(item => nameToId(item));
    
    // Get already added items
    const addedItems = menuChanges[category].add || [];
    
    // Filter out items already present or added
    return allItems.filter(item => 
      !currentItems.includes(item.id) && !addedItems.includes(item.id)
    );
  };

  const RemoveItemsTab = () => (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Click on any item below to mark it for removal from your menu
      </p>

      {/* Proteins - Show each individual protein */}
      {allProteins.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-category-entrees" />
            <h3 className="font-semibold text-foreground">Proteins</h3>
            <span className="text-xs text-muted-foreground">({allProteins.length} selected)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allProteins.map((protein, index) => {
              const proteinId = nameToId(protein);
              const isRemoved = menuChanges.proteins.remove.includes(proteinId);
              return (
                <Badge
                  key={`${proteinId}-${index}`}
                  variant={isRemoved ? "destructive" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isRemoved && "line-through"
                  )}
                  onClick={() => handleToggleRemove('proteins', proteinId)}
                >
                  {isRemoved && <Minus className="h-3 w-3 mr-1" />}
                  {getDisplayName(protein)}
                  {!isRemoved && <X className="h-3 w-3 ml-1 opacity-50" />}
                </Badge>
              );
            })}
          </div>
          {menuChanges.proteins.remove.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {menuChanges.proteins.remove.length} protein(s) marked for removal
            </p>
          )}
        </div>
      )}

      {/* Appetizers */}
      {currentAppetizers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-category-appetizers" />
            <h3 className="font-semibold text-foreground">Appetizers</h3>
            <span className="text-xs text-muted-foreground">({currentAppetizers.length} items)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentAppetizers.map((item, index) => {
              const itemId = nameToId(item);
              const isRemoved = menuChanges.appetizers.remove.includes(itemId);
              return (
                <Badge
                  key={`${itemId}-${index}`}
                  variant={isRemoved ? "destructive" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isRemoved && "line-through"
                  )}
                  onClick={() => handleToggleRemove('appetizers', itemId)}
                >
                  {isRemoved && <Minus className="h-3 w-3 mr-1" />}
                  {getDisplayName(item)}
                  {!isRemoved && <X className="h-3 w-3 ml-1 opacity-50" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Sides */}
      {currentSides.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-category-sides" />
            <h3 className="font-semibold text-foreground">Sides</h3>
            <span className="text-xs text-muted-foreground">({currentSides.length} items)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSides.map((item, index) => {
              const itemId = nameToId(item);
              const isRemoved = menuChanges.sides.remove.includes(itemId);
              return (
                <Badge
                  key={`${itemId}-${index}`}
                  variant={isRemoved ? "destructive" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isRemoved && "line-through"
                  )}
                  onClick={() => handleToggleRemove('sides', itemId)}
                >
                  {isRemoved && <Minus className="h-3 w-3 mr-1" />}
                  {getDisplayName(item)}
                  {!isRemoved && <X className="h-3 w-3 ml-1 opacity-50" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Desserts */}
      {currentDesserts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-category-desserts" />
            <h3 className="font-semibold text-foreground">Desserts</h3>
            <span className="text-xs text-muted-foreground">({currentDesserts.length} items)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentDesserts.map((item, index) => {
              const itemId = nameToId(item);
              const isRemoved = menuChanges.desserts.remove.includes(itemId);
              return (
                <Badge
                  key={`${itemId}-${index}`}
                  variant={isRemoved ? "destructive" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isRemoved && "line-through"
                  )}
                  onClick={() => handleToggleRemove('desserts', itemId)}
                >
                  {isRemoved && <Minus className="h-3 w-3 mr-1" />}
                  {getDisplayName(item)}
                  {!isRemoved && <X className="h-3 w-3 ml-1 opacity-50" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Drinks */}
      {currentDrinks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Drinks</h3>
            <span className="text-xs text-muted-foreground">({currentDrinks.length} items)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentDrinks.map((item, index) => {
              const itemId = nameToId(item);
              const isRemoved = menuChanges.drinks.remove.includes(itemId);
              return (
                <Badge
                  key={`${itemId}-${index}`}
                  variant={isRemoved ? "destructive" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isRemoved && "line-through"
                  )}
                  onClick={() => handleToggleRemove('drinks', itemId)}
                >
                  {isRemoved && <Minus className="h-3 w-3 mr-1" />}
                  {getDisplayName(item)}
                  {!isRemoved && <X className="h-3 w-3 ml-1 opacity-50" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const AddItemsTab = () => {
    const availableAppetizers = getAvailableItems('appetizers');
    const availableSides = getAvailableItems('sides');
    const availableDesserts = getAvailableItems('desserts');
    const availableDrinks = getAvailableItems('drinks');

    // Separate popular items
    const popularAppetizers = availableAppetizers.filter(item => item.isPopular);
    const regularAppetizers = availableAppetizers.filter(item => !item.isPopular);
    
    const popularSides = availableSides.filter(item => item.isPopular);
    const regularSides = availableSides.filter(item => !item.isPopular);
    
    const popularDesserts = availableDesserts.filter(item => item.isPopular);
    const regularDesserts = availableDesserts.filter(item => !item.isPopular);

    return (
      <div className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Select items from our complete menu to add to your order
        </p>

        {/* Appetizers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="add-appetizers" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-category-appetizers" />
              <span className="font-semibold">Add Appetizers</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {availableAppetizers.length} available
            </span>
          </div>
          <Select onValueChange={(value) => handleAddItem('appetizers', value)}>
            <SelectTrigger id="add-appetizers" className="bg-background">
              <SelectValue placeholder="Choose from our appetizer menu..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableAppetizers.length > 0 ? (
                <>
                  {popularAppetizers.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Most Popular</div>
                      {popularAppetizers.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            {item.isVegetarian && <Leaf className="h-3 w-3 text-green-600" />}
                            <Badge variant="secondary" className="ml-auto text-xs">Popular</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {regularAppetizers.length > 0 && (
                    <>
                      {popularAppetizers.length > 0 && <div className="h-px bg-border my-1" />}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All Appetizers</div>
                      {regularAppetizers.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            {item.isVegetarian && <Leaf className="h-3 w-3 text-green-600" />}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No more appetizers available</div>
              )}
            </SelectContent>
          </Select>
          {menuChanges.appetizers.add.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {menuChanges.appetizers.add.map((itemId: string, index: number) => (
                <Badge key={`${itemId}-${index}`} variant="default" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {getDisplayName(itemId)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveAddition('appetizers', itemId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sides */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="add-sides" className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-category-sides" />
              <span className="font-semibold">Add Sides</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {availableSides.length} available
            </span>
          </div>
          <Select onValueChange={(value) => handleAddItem('sides', value)}>
            <SelectTrigger id="add-sides" className="bg-background">
              <SelectValue placeholder="Choose from our sides menu..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableSides.length > 0 ? (
                <>
                  {popularSides.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Most Popular</div>
                      {popularSides.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            {item.isVegetarian && <Leaf className="h-3 w-3 text-green-600" />}
                            <Badge variant="secondary" className="ml-auto text-xs">Popular</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {regularSides.length > 0 && (
                    <>
                      {popularSides.length > 0 && <div className="h-px bg-border my-1" />}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All Sides</div>
                      {regularSides.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            {item.isVegetarian && <Leaf className="h-3 w-3 text-green-600" />}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No more sides available</div>
              )}
            </SelectContent>
          </Select>
          {menuChanges.sides.add.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {menuChanges.sides.add.map((itemId: string, index: number) => (
                <Badge key={`${itemId}-${index}`} variant="default" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {getDisplayName(itemId)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveAddition('sides', itemId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Desserts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="add-desserts" className="flex items-center gap-2">
              <Cookie className="h-4 w-4 text-category-desserts" />
              <span className="font-semibold">Add Desserts</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {availableDesserts.length} available
            </span>
          </div>
          <Select onValueChange={(value) => handleAddItem('desserts', value)}>
            <SelectTrigger id="add-desserts" className="bg-background">
              <SelectValue placeholder="Choose from Tanya's dessert menu..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableDesserts.length > 0 ? (
                <>
                  {popularDesserts.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Most Popular</div>
                      {popularDesserts.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            <Badge variant="secondary" className="ml-auto text-xs">Popular</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {regularDesserts.length > 0 && (
                    <>
                      {popularDesserts.length > 0 && <div className="h-px bg-border my-1" />}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All Desserts</div>
                      {regularDesserts.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No more desserts available</div>
              )}
            </SelectContent>
          </Select>
          {menuChanges.desserts.add.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {menuChanges.desserts.add.map((itemId: string, index: number) => (
                <Badge key={`${itemId}-${index}`} variant="default" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {getDisplayName(itemId)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveAddition('desserts', itemId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Drinks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="add-drinks" className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <span className="font-semibold">Add Drinks</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {availableDrinks.length} available
            </span>
          </div>
          <Select onValueChange={(value) => handleAddItem('drinks', value)}>
            <SelectTrigger id="add-drinks" className="bg-background">
              <SelectValue placeholder="Choose from our drink menu..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableDrinks.length > 0 ? (
                availableDrinks.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.isPopular && (
                        <Badge variant="secondary" className="ml-auto text-xs">Popular</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No more drinks available</div>
              )}
            </SelectContent>
          </Select>
          {menuChanges.drinks.add.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {menuChanges.drinks.add.map((itemId: string, index: number) => (
                <Badge key={`${itemId}-${index}`} variant="default" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {getDisplayName(itemId)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveAddition('drinks', itemId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Note about proteins */}
        <div className="rounded-lg border p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ChefHat className="h-3 w-3" />
            <strong>Protein Changes:</strong> To modify protein selections, please use the custom requests section below or contact us directly.
          </p>
        </div>
      </div>
    );
  };

  const ServiceOptionsTab = () => {
    const serviceGroups = [
      {
        title: 'Staff & Setup',
        items: [
          { id: 'wait_staff_requested', label: 'Wait Staff Service', current: quote.wait_staff_requested },
          { id: 'bussing_tables_needed', label: 'Bussing Service', current: quote.bussing_tables_needed },
        ]
      },
      {
        title: 'Serving Equipment',
        items: [
          { id: 'chafers_requested', label: 'Chafers (Food Warmers)', current: quote.chafers_requested },
          { id: 'serving_utensils_requested', label: 'Serving Utensils', current: quote.serving_utensils_requested },
        ]
      },
      {
        title: 'Table Setup',
        items: [
          { id: 'tables_chairs_requested', label: 'Tables & Chairs', current: quote.tables_chairs_requested },
          { id: 'linens_requested', label: 'Linens', current: quote.linens_requested },
        ]
      },
      {
        title: 'Dining Supplies',
        items: [
          { id: 'plates_requested', label: 'Plates', current: quote.plates_requested },
          { id: 'cups_requested', label: 'Cups', current: quote.cups_requested },
          { id: 'napkins_requested', label: 'Napkins', current: quote.napkins_requested },
        ]
      }
    ];

    return (
      <div className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Add or remove service options for your event
        </p>

        {serviceGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="font-semibold text-sm">{group.title}</h4>
            <div className="space-y-2">
              {group.items.map((service) => {
                const isChanged = menuChanges.service_options.hasOwnProperty(service.id);
                const currentValue = isChanged 
                  ? menuChanges.service_options[service.id]
                  : service.current;

                return (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Label htmlFor={service.id} className="font-normal cursor-pointer">
                        {service.label}
                      </Label>
                      {service.current && !isChanged && (
                        <Badge variant="outline" className="text-xs">
                          Currently included
                        </Badge>
                      )}
                      {isChanged && (
                        <Badge variant="secondary" className="text-xs">
                          {currentValue ? 'Adding' : 'Removing'}
                        </Badge>
                      )}
                    </div>
                    <Switch
                      id={service.id}
                      checked={currentValue}
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Request Menu Changes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your menu selections using the organized tabs below
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="remove" className="text-xs sm:text-sm">
              <Minus className="h-4 w-4 mr-1" />
              Remove Items
            </TabsTrigger>
            <TabsTrigger value="add" className="text-xs sm:text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Items
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remove">
            <RemoveItemsTab />
          </TabsContent>

          <TabsContent value="add">
            <AddItemsTab />
          </TabsContent>

          <TabsContent value="services">
            <ServiceOptionsTab />
          </TabsContent>
        </Tabs>

        {/* Custom Requests Section */}
        <div className="mt-6 space-y-3">
          <Label htmlFor="custom-requests" className="flex items-center gap-2 font-semibold">
            <Edit className="h-4 w-4" />
            Additional Custom Requests
          </Label>
          <Textarea
            id="custom-requests"
            placeholder="Have special requests? Let us know! Examples: dietary substitutions, protein changes, specific preparations, timing requirements, etc."
            value={menuChanges.custom_requests}
            onChange={(e) => handleCustomRequestChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Describe any special requests not covered above
          </p>
        </div>

        {/* Changes Summary */}
        {hasChanges() && (
          <div className="mt-6 border rounded-lg p-4 bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Your Change Summary</h4>
            </div>
            <div className="space-y-2 text-sm">
              {/* Removals */}
              {['proteins', 'appetizers', 'sides', 'desserts', 'drinks'].map((category) => {
                const removes = menuChanges[category]?.remove || [];
                if (removes.length === 0) return null;
                return (
                  <div key={`remove-${category}`} className="flex items-start gap-2">
                    <Minus className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Remove {category}: <span className="font-medium text-foreground">
                        {removes.map((id: string) => getDisplayName(id)).join(', ')}
                      </span>
                    </span>
                  </div>
                );
              })}

              {/* Additions */}
              {['appetizers', 'sides', 'desserts', 'drinks'].map((category) => {
                const adds = menuChanges[category]?.add || [];
                if (adds.length === 0) return null;
                return (
                  <div key={`add-${category}`} className="flex items-start gap-2">
                    <Plus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Add {category}: <span className="font-medium text-foreground">
                        {adds.map((id: string) => getDisplayName(id)).join(', ')}
                      </span>
                    </span>
                  </div>
                );
              })}

              {/* Service Changes */}
              {Object.keys(menuChanges.service_options).length > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Service updates: <span className="font-medium text-foreground">{Object.keys(menuChanges.service_options).length} change(s)</span>
                  </span>
                </div>
              )}

              {/* Custom Requests */}
              {menuChanges.custom_requests.trim() && (
                <div className="flex items-start gap-2">
                  <Edit className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Custom requests provided
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
