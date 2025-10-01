/**
 * MenuChangeSelector - Main orchestration component for menu changes
 * Reduced from 957 lines to ~150 lines by extracting sub-components
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Minus, Plus, Settings } from 'lucide-react';
import { MenuChangeManager, MenuChanges } from '@/services/MenuChangeManager';
import { MenuItemService } from '@/services/MenuItemService';
import { MenuRemovalTab } from './menu-change/MenuRemovalTab';
import { MenuAdditionTab } from './menu-change/MenuAdditionTab';
import { ServiceOptionsTab } from './menu-change/ServiceOptionsTab';
import { MenuChangesSummary } from './menu-change/MenuChangesSummary';

interface MenuChangeSelectorProps {
  quote: any;
  onChange: (changes: MenuChanges) => void;
}

export function MenuChangeSelector({ quote, onChange }: MenuChangeSelectorProps) {
  const [menuChanges, setMenuChanges] = useState<MenuChanges>(
    MenuChangeManager.createEmptyChanges()
  );
  const [activeTab, setActiveTab] = useState('remove');

  // Get current menu items from quote
  const allProteins = MenuChangeManager.getAllProteins(quote);
  const currentAppetizers = MenuChangeManager.formatArrayField(quote.appetizers);
  const currentSides = MenuChangeManager.formatArrayField(quote.sides);
  const currentDesserts = MenuChangeManager.formatArrayField(quote.desserts);
  const currentDrinks = MenuChangeManager.formatArrayField(quote.drinks);

  // Handlers that update state and notify parent
  const handleToggleRemove = (category: string, itemId: string) => {
    const updated = MenuChangeManager.toggleRemoval(
      menuChanges, 
      category as any, 
      itemId
    );
    setMenuChanges(updated);
    onChange(updated);
  };

  const handleAddItem = (category: string, itemId: string) => {
    const updated = MenuChangeManager.addItem(
      menuChanges,
      category as any,
      itemId
    );
    setMenuChanges(updated);
    onChange(updated);
  };

  const handleRemoveAddition = (category: string, itemId: string) => {
    const updated = MenuChangeManager.removeAddition(
      menuChanges,
      category as any,
      itemId
    );
    setMenuChanges(updated);
    onChange(updated);
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    const updated = MenuChangeManager.toggleService(menuChanges, service, checked);
    setMenuChanges(updated);
    onChange(updated);
  };

  const handleCustomRequestChange = (value: string) => {
    const updated = MenuChangeManager.updateCustomRequests(menuChanges, value);
    setMenuChanges(updated);
    onChange(updated);
  };

  // Get available items for addition
  const availableProteins = MenuItemService.getAvailableItems(
    'proteins',
    allProteins,
    menuChanges.proteins.add
  );
  const availableAppetizers = MenuItemService.getAvailableItems(
    'appetizers',
    currentAppetizers,
    menuChanges.appetizers.add
  );
  const availableSides = MenuItemService.getAvailableItems(
    'sides',
    currentSides,
    menuChanges.sides.add
  );
  const availableDesserts = MenuItemService.getAvailableItems(
    'desserts',
    currentDesserts,
    menuChanges.desserts.add
  );
  const availableDrinks = MenuItemService.getAvailableItems(
    'drinks',
    currentDrinks,
    menuChanges.drinks.add
  );

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
              <Settings className="h-4 w-4 mr-1" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remove">
            <MenuRemovalTab
              allProteins={allProteins}
              currentAppetizers={currentAppetizers}
              currentSides={currentSides}
              currentDesserts={currentDesserts}
              currentDrinks={currentDrinks}
              menuChanges={menuChanges}
              onToggleRemove={handleToggleRemove}
            />
          </TabsContent>

          <TabsContent value="add">
            <MenuAdditionTab
              availableProteins={availableProteins}
              availableAppetizers={availableAppetizers}
              availableSides={availableSides}
              availableDesserts={availableDesserts}
              availableDrinks={availableDrinks}
              menuChanges={menuChanges}
              onAddItem={handleAddItem}
              onRemoveAddition={handleRemoveAddition}
            />
          </TabsContent>

          <TabsContent value="services">
            <ServiceOptionsTab
              quote={quote}
              menuChanges={menuChanges}
              onServiceToggle={handleServiceToggle}
            />
          </TabsContent>
        </Tabs>

        {/* Custom Requests Section */}
        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium">Additional Custom Requests</label>
          <Textarea
            placeholder="Describe any other specific changes or requests you'd like to make..."
            value={menuChanges.custom_requests}
            onChange={(e) => handleCustomRequestChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Summary of Changes */}
        {MenuChangeManager.hasChanges(menuChanges) && (
          <MenuChangesSummary menuChanges={menuChanges} />
        )}
      </CardContent>
    </Card>
  );
}
