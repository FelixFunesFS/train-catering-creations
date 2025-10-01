/**
 * MenuChangesSummary - Displays a summary of all menu changes
 * Shows what's being added, removed, and modified
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Edit } from 'lucide-react';
import { MenuChanges } from '@/services/MenuChangeManager';
import { MenuItemService } from '@/services/MenuItemService';

interface MenuChangesSummaryProps {
  menuChanges: MenuChanges;
}

export function MenuChangesSummary({ menuChanges }: MenuChangesSummaryProps) {
  const getDisplayName = MenuItemService.getDisplayName;

  return (
    <div className="space-y-4 mt-6 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Edit className="h-4 w-4" />
        <h4 className="font-semibold">Summary of Changes</h4>
      </div>
      <Separator />
      
      {/* Removed Items */}
      {(menuChanges.proteins.remove.length > 0 || 
        menuChanges.appetizers.remove.length > 0 ||
        menuChanges.sides.remove.length > 0 ||
        menuChanges.desserts.remove.length > 0 ||
        menuChanges.drinks.remove.length > 0) && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Minus className="h-3 w-3 text-destructive" />
            Items to Remove:
          </p>
          <div className="flex flex-wrap gap-2">
            {menuChanges.proteins.remove.map((id: string) => (
              <Badge key={id} variant="destructive" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.appetizers.remove.map((id: string) => (
              <Badge key={id} variant="destructive" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.sides.remove.map((id: string) => (
              <Badge key={id} variant="destructive" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.desserts.remove.map((id: string) => (
              <Badge key={id} variant="destructive" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.drinks.remove.map((id: string) => (
              <Badge key={id} variant="destructive" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Added Items */}
      {(menuChanges.proteins.add.length > 0 || 
        menuChanges.appetizers.add.length > 0 ||
        menuChanges.sides.add.length > 0 ||
        menuChanges.desserts.add.length > 0 ||
        menuChanges.drinks.add.length > 0) && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-3 w-3 text-primary" />
            Items to Add:
          </p>
          <div className="flex flex-wrap gap-2">
            {menuChanges.proteins.add.map((id: string) => (
              <Badge key={id} variant="default" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.appetizers.add.map((id: string) => (
              <Badge key={id} variant="default" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.sides.add.map((id: string) => (
              <Badge key={id} variant="default" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.desserts.add.map((id: string) => (
              <Badge key={id} variant="default" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
            {menuChanges.drinks.add.map((id: string) => (
              <Badge key={id} variant="default" className="text-xs">
                {getDisplayName(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Service Changes */}
      {Object.keys(menuChanges.service_options).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Service Option Changes:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(menuChanges.service_options).map(([key, value]) => (
              <Badge key={key} variant={value ? "default" : "destructive"} className="text-xs">
                {key.replace(/_/g, ' ')}: {value ? 'Adding' : 'Removing'}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Requests */}
      {menuChanges.custom_requests && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Custom Requests:</p>
          <p className="text-xs text-muted-foreground">{menuChanges.custom_requests}</p>
        </div>
      )}
    </div>
  );
}
