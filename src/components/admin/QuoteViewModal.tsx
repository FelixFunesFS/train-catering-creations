import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  ChefHat
} from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface QuoteViewModalProps {
  quote: QuoteRequest;
  onClose: () => void;
}

export function QuoteViewModal({ quote, onClose }: QuoteViewModalProps) {
  const formatArrayField = (field: any) => {
    if (!field) return [];
    try {
      return Array.isArray(field) ? field : JSON.parse(field);
    } catch {
      return [];
    }
  };

  const formatTimeField = (time: string | null) => {
    if (!time) return 'Not specified';
    return format(new Date(`1970-01-01T${time}`), 'h:mm a');
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    switch (serviceType) {
      case 'full-service': return 'Full Service Catering';
      case 'delivery-setup': return 'Delivery + Setup';
      case 'drop-off': return 'Drop-Off Service';
      default: return serviceType;
    }
  };

  const appetizers = formatArrayField(quote.appetizers);
  const sides = formatArrayField(quote.sides);
  const desserts = formatArrayField(quote.desserts);
  const drinks = formatArrayField(quote.drinks);
  const dietaryRestrictions = formatArrayField(quote.dietary_restrictions);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background border-b px-6 py-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold truncate">
                  {quote.event_name}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-muted-foreground text-sm">
                    Quote Request Summary
                  </p>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {quote.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="font-semibold">{quote.contact_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{quote.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{quote.phone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Referral Source</p>
                  <p>{quote.referral_source || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Event Name</p>
                  <p className="font-semibold">{quote.event_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                  <Badge variant="outline">{quote.event_type}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{format(new Date(quote.event_date), 'EEEE, MMMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{formatTimeField(quote.start_time)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Guest Count</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p>{quote.guest_count} guests</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                  <Badge>{getServiceTypeDisplay(quote.service_type)}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{quote.location}</p>
                </div>
              </div>

              {quote.serving_start_time && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Serving Start Time</p>
                  <p>{formatTimeField(quote.serving_start_time)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Menu Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Proteins */}
              {(quote.primary_protein || quote.secondary_protein) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">PROTEINS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quote.primary_protein && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">Primary: {quote.primary_protein}</p>
                      </div>
                    )}
                    {quote.secondary_protein && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">Secondary: {quote.secondary_protein}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appetizers */}
              {appetizers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">APPETIZERS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {appetizers.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-muted/30 rounded">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sides */}
              {sides.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">SIDES</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sides.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-muted/30 rounded">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desserts */}
              {desserts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">DESSERTS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {desserts.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-muted/30 rounded">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drinks */}
              {drinks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">DRINKS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {drinks.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-muted/30 rounded">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Restrictions */}
              {dietaryRestrictions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">DIETARY RESTRICTIONS</h4>
                  <div className="flex flex-wrap gap-2">
                    {dietaryRestrictions.map((restriction: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                  {quote.guest_count_with_restrictions && (
                    <p className="text-sm text-muted-foreground">
                      Guest count with restrictions: {quote.guest_count_with_restrictions}
                    </p>
                  )}
                </div>
              )}

              {/* Special Requests */}
              {quote.special_requests && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">SPECIAL REQUESTS</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{quote.special_requests}</p>
                  </div>
                </div>
              )}

              {/* Custom Menu Requests */}
              {quote.custom_menu_requests && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">CUSTOM MENU REQUESTS</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{quote.custom_menu_requests}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}