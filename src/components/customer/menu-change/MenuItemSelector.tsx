/**
 * MenuItemSelector - Reusable component for selecting menu items
 * Displays items categorized by popularity with vegetarian indicators
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Plus, X } from 'lucide-react';
import { MenuItem } from '@/services/MenuItemService';
import { MenuItemService } from '@/services/MenuItemService';

interface MenuItemSelectorProps {
  category: string;
  label: string;
  icon: React.ReactNode;
  availableItems: MenuItem[];
  addedItems: string[];
  placeholder: string;
  onAdd: (itemId: string) => void;
  onRemoveAdded: (itemId: string) => void;
}

export function MenuItemSelector({
  category,
  label,
  icon,
  availableItems,
  addedItems,
  placeholder,
  onAdd,
  onRemoveAdded
}: MenuItemSelectorProps) {
  const { popular, regular } = MenuItemService.separateByPopularity(availableItems);
  const getDisplayName = (idOrName: string) => MenuItemService.getDisplayName(idOrName);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={`add-${category}`} className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{label}</span>
        </Label>
        <span className="text-xs text-muted-foreground">
          {availableItems.length} available
        </span>
      </div>
      
      <Select onValueChange={onAdd}>
        <SelectTrigger id={`add-${category}`} className="bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {availableItems.length > 0 ? (
            <>
              {popular.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Most Popular</div>
                  {popular.map((item) => (
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
              {regular.length > 0 && (
                <>
                  {popular.length > 0 && <div className="h-px bg-border my-1" />}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All {label}</div>
                  {regular.map((item) => (
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
            <div className="p-2 text-sm text-muted-foreground">No more {category} available</div>
          )}
        </SelectContent>
      </Select>
      
      {addedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {addedItems.map((itemId: string, index: number) => (
            <Badge key={`${itemId}-${index}`} variant="default" className="gap-1">
              <Plus className="h-3 w-3" />
              {getDisplayName(itemId)}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => onRemoveAdded(itemId)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
