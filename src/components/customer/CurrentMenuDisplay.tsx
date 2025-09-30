import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UtensilsCrossed, 
  Cookie, 
  Coffee, 
  Users,
  ChefHat,
  Wine,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CurrentMenuDisplayProps {
  quote: any;
}

export function CurrentMenuDisplay({ quote }: CurrentMenuDisplayProps) {
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

  const appetizers = formatArrayField(quote.appetizers);
  const sides = formatArrayField(quote.sides);
  const desserts = formatArrayField(quote.desserts);
  const drinks = formatArrayField(quote.drinks);
  const dietaryRestrictions = formatArrayField(quote.dietary_restrictions);

  const MenuSection = ({ 
    title, 
    items, 
    icon: Icon, 
    emptyMessage 
  }: { 
    title: string; 
    items: string[]; 
    icon: any; 
    emptyMessage: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">{emptyMessage}</span>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Your Current Menu & Services
        </CardTitle>
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
              <Badge variant="default" className="text-xs">
                Primary: {quote.primary_protein}
              </Badge>
            )}
            {quote.secondary_protein && (
              <Badge variant="default" className="text-xs">
                Secondary: {quote.secondary_protein}
              </Badge>
            )}
            {!quote.primary_protein && !quote.secondary_protein && (
              <span className="text-xs text-muted-foreground italic">No proteins selected</span>
            )}
          </div>
        </div>

        {/* Appetizers */}
        <MenuSection 
          title="Appetizers" 
          items={appetizers} 
          icon={Cookie}
          emptyMessage="No appetizers selected"
        />

        {/* Sides */}
        <MenuSection 
          title="Sides" 
          items={sides} 
          icon={UtensilsCrossed}
          emptyMessage="No sides selected"
        />

        {/* Desserts */}
        <MenuSection 
          title="Desserts" 
          items={desserts} 
          icon={Cookie}
          emptyMessage="No desserts selected"
        />

        {/* Drinks */}
        <MenuSection 
          title="Drinks" 
          items={drinks} 
          icon={Coffee}
          emptyMessage="No drinks selected"
        />

        {/* Service Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Service Options</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {quote.wait_staff_requested && (
              <Badge variant="outline" className="text-xs">Wait Staff</Badge>
            )}
            {quote.chafers_requested && (
              <Badge variant="outline" className="text-xs">Chafers</Badge>
            )}
            {quote.tables_chairs_requested && (
              <Badge variant="outline" className="text-xs">Tables & Chairs</Badge>
            )}
            {quote.serving_utensils_requested && (
              <Badge variant="outline" className="text-xs">Serving Utensils</Badge>
            )}
            {quote.plates_requested && (
              <Badge variant="outline" className="text-xs">Plates</Badge>
            )}
            {quote.cups_requested && (
              <Badge variant="outline" className="text-xs">Cups</Badge>
            )}
            {quote.napkins_requested && (
              <Badge variant="outline" className="text-xs">Napkins</Badge>
            )}
            {!quote.wait_staff_requested && !quote.chafers_requested && 
             !quote.tables_chairs_requested && !quote.serving_utensils_requested && 
             !quote.plates_requested && !quote.cups_requested && !quote.napkins_requested && (
              <span className="text-xs text-muted-foreground italic">No additional services selected</span>
            )}
          </div>
        </div>

        {/* Dietary Restrictions */}
        {dietaryRestrictions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Dietary Restrictions</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map((restriction, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {restriction}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
