/**
 * MenuRemovalTab - UI component for removing menu items
 * Focused on displaying current menu selections and allowing removal
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Sparkles, UtensilsCrossed, Cookie, Coffee, Minus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuItemService } from '@/services/MenuItemService';
import { MenuChanges } from '@/services/MenuChangeManager';

interface MenuRemovalTabProps {
  allProteins: string[];
  currentAppetizers: string[];
  currentSides: string[];
  currentDesserts: string[];
  currentDrinks: string[];
  menuChanges: MenuChanges;
  onToggleRemove: (category: string, itemId: string) => void;
}

export function MenuRemovalTab({
  allProteins,
  currentAppetizers,
  currentSides,
  currentDesserts,
  currentDrinks,
  menuChanges,
  onToggleRemove
}: MenuRemovalTabProps) {
  const nameToId = (name: string) => MenuItemService.nameToId(name);
  const getDisplayName = (idOrName: string) => MenuItemService.getDisplayName(idOrName);

  return (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Click on any item below to mark it for removal from your menu
      </p>

      {/* Proteins */}
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
                    "cursor-pointer hover:bg-muted/50",
                    isRemoved && "line-through"
                  )}
                  onClick={() => onToggleRemove('proteins', proteinId)}
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
                    "cursor-pointer hover:bg-muted/50",
                    isRemoved && "line-through"
                  )}
                  onClick={() => onToggleRemove('appetizers', itemId)}
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
                    "cursor-pointer hover:bg-muted/50",
                    isRemoved && "line-through"
                  )}
                  onClick={() => onToggleRemove('sides', itemId)}
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
                    "cursor-pointer hover:bg-muted/50",
                    isRemoved && "line-through"
                  )}
                  onClick={() => onToggleRemove('desserts', itemId)}
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
                    "cursor-pointer hover:bg-muted/50",
                    isRemoved && "line-through"
                  )}
                  onClick={() => onToggleRemove('drinks', itemId)}
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
}
