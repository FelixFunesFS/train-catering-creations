import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Plus,
  UtensilsCrossed,
  Cookie,
  Coffee,
  CheckCircle,
  Edit
} from 'lucide-react';

interface MenuChangeSelectorProps {
  quote: any;
  onChange: (changes: any) => void;
}

export function MenuChangeSelector({ quote, onChange }: MenuChangeSelectorProps) {
  const [menuChanges, setMenuChanges] = useState<any>({
    proteins: { remove: [], add: [] },
    appetizers: { remove: [], add: [] },
    sides: { remove: [], add: [] },
    desserts: { remove: [], add: [] },
    drinks: { remove: [], add: [] },
    dietary_restrictions: { add: [] },
    service_options: {},
    custom_requests: ''
  });

  const formatArrayField = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const currentAppetizers = formatArrayField(quote.appetizers);
  const currentSides = formatArrayField(quote.sides);
  const currentDesserts = formatArrayField(quote.desserts);
  const currentDrinks = formatArrayField(quote.drinks);

  const handleToggleRemove = (category: string, item: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      const removeList = updated[category].remove || [];
      
      if (removeList.includes(item)) {
        updated[category].remove = removeList.filter((i: string) => i !== item);
      } else {
        updated[category].remove = [...removeList, item];
      }
      
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
      menuChanges.appetizers.remove.length > 0 ||
      menuChanges.sides.remove.length > 0 ||
      menuChanges.desserts.remove.length > 0 ||
      menuChanges.drinks.remove.length > 0 ||
      Object.keys(menuChanges.service_options).length > 0 ||
      menuChanges.custom_requests.trim().length > 0
    );
  };

  const RemovableItemSection = ({ 
    title, 
    category,
    items, 
    icon: Icon 
  }: { 
    title: string; 
    category: string;
    items: string[]; 
    icon: any;
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const isRemoving = menuChanges[category]?.remove?.includes(item);
            return (
              <Badge
                key={index}
                variant={isRemoving ? "destructive" : "secondary"}
                className="text-xs cursor-pointer transition-all"
                onClick={() => handleToggleRemove(category, item)}
              >
                {isRemoving ? (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Remove: {item}
                  </>
                ) : (
                  <>
                    {item}
                    <X className="h-3 w-3 ml-1 opacity-50 hover:opacity-100" />
                  </>
                )}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Request Menu Changes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on items to remove them or add custom requests below
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Proteins */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Proteins</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {quote.primary_protein && (
              <Badge
                variant={menuChanges.proteins.remove.includes('primary') ? "destructive" : "default"}
                className="text-xs cursor-pointer"
                onClick={() => handleToggleRemove('proteins', 'primary')}
              >
                {menuChanges.proteins.remove.includes('primary') && <X className="h-3 w-3 mr-1" />}
                Primary: {quote.primary_protein}
                {!menuChanges.proteins.remove.includes('primary') && <X className="h-3 w-3 ml-1 opacity-50" />}
              </Badge>
            )}
            {quote.secondary_protein && (
              <Badge
                variant={menuChanges.proteins.remove.includes('secondary') ? "destructive" : "default"}
                className="text-xs cursor-pointer"
                onClick={() => handleToggleRemove('proteins', 'secondary')}
              >
                {menuChanges.proteins.remove.includes('secondary') && <X className="h-3 w-3 mr-1" />}
                Secondary: {quote.secondary_protein}
                {!menuChanges.proteins.remove.includes('secondary') && <X className="h-3 w-3 ml-1 opacity-50" />}
              </Badge>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <RemovableItemSection 
          title="Appetizers" 
          category="appetizers"
          items={currentAppetizers} 
          icon={Cookie}
        />

        <RemovableItemSection 
          title="Sides" 
          category="sides"
          items={currentSides} 
          icon={UtensilsCrossed}
        />

        <RemovableItemSection 
          title="Desserts" 
          category="desserts"
          items={currentDesserts} 
          icon={Cookie}
        />

        <RemovableItemSection 
          title="Drinks" 
          category="drinks"
          items={currentDrinks} 
          icon={Coffee}
        />

        {/* Service Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Service Options Changes</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'wait_staff_requested', label: 'Wait Staff', current: quote.wait_staff_requested },
              { id: 'chafers_requested', label: 'Chafers', current: quote.chafers_requested },
              { id: 'tables_chairs_requested', label: 'Tables & Chairs', current: quote.tables_chairs_requested },
              { id: 'serving_utensils_requested', label: 'Serving Utensils', current: quote.serving_utensils_requested },
              { id: 'plates_requested', label: 'Plates', current: quote.plates_requested },
              { id: 'cups_requested', label: 'Cups', current: quote.cups_requested },
              { id: 'napkins_requested', label: 'Napkins', current: quote.napkins_requested },
            ].map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox
                  id={service.id}
                  checked={menuChanges.service_options[service.id] ?? service.current}
                  onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                />
                <Label 
                  htmlFor={service.id} 
                  className="text-sm cursor-pointer"
                >
                  {service.label}
                  {service.current && (
                    <span className="text-xs text-muted-foreground ml-1">(current)</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Requests */}
        <div className="space-y-2">
          <Label htmlFor="custom-requests" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Additional Requests or Substitutions
          </Label>
          <Textarea
            id="custom-requests"
            placeholder="Example: 'Add baked salmon instead of fried chicken' or 'Need 2 additional vegetarian meals' or 'Add cocktail napkins'"
            value={menuChanges.custom_requests}
            onChange={(e) => handleCustomRequestChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Specify any additions, substitutions, or special menu requests here
          </p>
        </div>

        {/* Changes Summary */}
        {hasChanges() && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2 text-sm">Your Requested Changes:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {menuChanges.proteins.remove.length > 0 && (
                <li>• Remove proteins: {menuChanges.proteins.remove.join(', ')}</li>
              )}
              {menuChanges.appetizers.remove.length > 0 && (
                <li>• Remove appetizers: {menuChanges.appetizers.remove.join(', ')}</li>
              )}
              {menuChanges.sides.remove.length > 0 && (
                <li>• Remove sides: {menuChanges.sides.remove.join(', ')}</li>
              )}
              {menuChanges.desserts.remove.length > 0 && (
                <li>• Remove desserts: {menuChanges.desserts.remove.join(', ')}</li>
              )}
              {menuChanges.drinks.remove.length > 0 && (
                <li>• Remove drinks: {menuChanges.drinks.remove.join(', ')}</li>
              )}
              {Object.keys(menuChanges.service_options).length > 0 && (
                <li>• Service option changes requested</li>
              )}
              {menuChanges.custom_requests && (
                <li>• Custom requests provided</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
