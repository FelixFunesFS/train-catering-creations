import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatEventName, formatLocation } from '@/utils/textFormatters';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Utensils, 
  Coffee,
  Settings,
  AlertCircle
} from 'lucide-react';

interface QuoteReferencePanelProps {
  quote: any;
}

export function QuoteReferencePanel({ quote }: QuoteReferencePanelProps) {
  const formatList = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return 'None selected';
    return items.join(', ');
  };

  return (
    <Card className="sticky top-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quote Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Event Details */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Event Details
          </h4>
          <div className="space-y-1 text-xs">
            <div><strong>Event:</strong> {formatEventName(quote.event_name)}</div>
            <div><strong>Date:</strong> {new Date(quote.event_date).toLocaleDateString()}</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {quote.start_time}
              {quote.serving_start_time && ` - ${quote.serving_start_time}`}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatLocation(quote.location)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {quote.guest_count} guests
            </div>
          </div>
        </div>

        <Separator />

        {/* Menu Selections */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Utensils className="h-3 w-3" />
            Menu Selections
          </h4>
          
          <div className="space-y-2 text-xs">
            <div>
              <Badge variant="secondary" className="text-xs mb-1">Service: {quote.service_type}</Badge>
            </div>
            
            {quote.proteins && Array.isArray(quote.proteins) && quote.proteins.length > 0 && (
              <div>
                <strong>Proteins:</strong>
                <div className="ml-2 text-muted-foreground">{quote.proteins.join(', ')}</div>
                {quote.both_proteins_available && quote.proteins.length === 2 && (
                  <div className="ml-2 text-xs italic">Both proteins served to all guests</div>
                )}
              </div>
            )}
            
            {quote.appetizers && quote.appetizers.length > 0 && (
              <div>
                <strong>Appetizers:</strong>
                <div className="ml-2 text-muted-foreground">{formatList(quote.appetizers)}</div>
              </div>
            )}
            
            {quote.sides && quote.sides.length > 0 && (
              <div>
                <strong>Sides:</strong>
                <div className="ml-2 text-muted-foreground">{formatList(quote.sides)}</div>
              </div>
            )}
            
            {quote.desserts && quote.desserts.length > 0 && (
              <div>
                <strong>Desserts:</strong>
                <div className="ml-2 text-muted-foreground">{formatList(quote.desserts)}</div>
              </div>
            )}
            
            {quote.drinks && quote.drinks.length > 0 && (
              <div>
                <strong>Drinks:</strong>
                <div className="ml-2 text-muted-foreground">{formatList(quote.drinks)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Dietary Restrictions */}
        {quote.dietary_restrictions && quote.dietary_restrictions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Dietary Restrictions
              </h4>
              <div className="text-xs space-y-1">
                {quote.dietary_restrictions.map((restriction: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs mr-1">
                    {restriction}
                  </Badge>
                ))}
                {quote.guest_count_with_restrictions && (
                  <div className="text-muted-foreground">
                    Guests with restrictions: {quote.guest_count_with_restrictions}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Equipment & Services */}
        <Separator />
        <div className="space-y-2">
          <h4 className="font-medium">Equipment & Services</h4>
          <div className="space-y-1 text-xs">
            {quote.wait_staff_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Wait Staff</Badge>
            )}
            {quote.chafers_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Chafers</Badge>
            )}
            {quote.linens_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Linens</Badge>
            )}
            {quote.tables_chairs_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Tables & Chairs</Badge>
            )}
            {quote.serving_utensils_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Serving Utensils</Badge>
            )}
            {quote.plates_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Plates</Badge>
            )}
            {quote.cups_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Cups</Badge>
            )}
            {quote.napkins_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Napkins</Badge>
            )}
            {quote.ice_requested && (
              <Badge variant="outline" className="text-xs block w-fit">Ice</Badge>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {quote.special_requests && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="font-medium">Special Requests</h4>
              <p className="text-xs text-muted-foreground">{quote.special_requests}</p>
            </div>
          </>
        )}

        {quote.custom_menu_requests && (
          <div className="space-y-1">
            <h4 className="font-medium">Custom Menu Requests</h4>
            <p className="text-xs text-muted-foreground">{quote.custom_menu_requests}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}