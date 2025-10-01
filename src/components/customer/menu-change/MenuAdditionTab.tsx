/**
 * MenuAdditionTab - UI component for adding menu items
 * Displays available items organized by category and popularity
 */

import React from 'react';
import { ChefHat, Sparkles, UtensilsCrossed, Cookie, Coffee } from 'lucide-react';
import { MenuItemSelector } from './MenuItemSelector';
import { MenuItem } from '@/services/MenuItemService';
import { MenuChanges } from '@/services/MenuChangeManager';

interface MenuAdditionTabProps {
  availableProteins: MenuItem[];
  availableAppetizers: MenuItem[];
  availableSides: MenuItem[];
  availableDesserts: MenuItem[];
  availableDrinks: MenuItem[];
  menuChanges: MenuChanges;
  onAddItem: (category: string, itemId: string) => void;
  onRemoveAddition: (category: string, itemId: string) => void;
}

export function MenuAdditionTab({
  availableProteins,
  availableAppetizers,
  availableSides,
  availableDesserts,
  availableDrinks,
  menuChanges,
  onAddItem,
  onRemoveAddition
}: MenuAdditionTabProps) {
  return (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Select items from our complete menu to add to your order
      </p>

      <MenuItemSelector
        category="proteins"
        label="Add Proteins"
        icon={<ChefHat className="h-4 w-4 text-category-entrees" />}
        availableItems={availableProteins}
        addedItems={menuChanges.proteins.add}
        placeholder="Choose from our protein menu..."
        onAdd={(itemId) => onAddItem('proteins', itemId)}
        onRemoveAdded={(itemId) => onRemoveAddition('proteins', itemId)}
      />

      <MenuItemSelector
        category="appetizers"
        label="Add Appetizers"
        icon={<Sparkles className="h-4 w-4 text-category-appetizers" />}
        availableItems={availableAppetizers}
        addedItems={menuChanges.appetizers.add}
        placeholder="Choose from our appetizer menu..."
        onAdd={(itemId) => onAddItem('appetizers', itemId)}
        onRemoveAdded={(itemId) => onRemoveAddition('appetizers', itemId)}
      />

      <MenuItemSelector
        category="sides"
        label="Add Sides"
        icon={<UtensilsCrossed className="h-4 w-4 text-category-sides" />}
        availableItems={availableSides}
        addedItems={menuChanges.sides.add}
        placeholder="Choose from our sides menu..."
        onAdd={(itemId) => onAddItem('sides', itemId)}
        onRemoveAdded={(itemId) => onRemoveAddition('sides', itemId)}
      />

      <MenuItemSelector
        category="desserts"
        label="Add Desserts"
        icon={<Cookie className="h-4 w-4 text-category-desserts" />}
        availableItems={availableDesserts}
        addedItems={menuChanges.desserts.add}
        placeholder="Choose from Tanya's dessert menu..."
        onAdd={(itemId) => onAddItem('desserts', itemId)}
        onRemoveAdded={(itemId) => onRemoveAddition('desserts', itemId)}
      />

      <MenuItemSelector
        category="drinks"
        label="Add Drinks"
        icon={<Coffee className="h-4 w-4 text-primary" />}
        availableItems={availableDrinks}
        addedItems={menuChanges.drinks.add}
        placeholder="Choose from our drink menu..."
        onAdd={(itemId) => onAddItem('drinks', itemId)}
        onRemoveAdded={(itemId) => onRemoveAddition('drinks', itemId)}
      />
    </div>
  );
}
