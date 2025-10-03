import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Quote {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  guest_count: number;
  location: string;
  contact_name: string;
  email: string;
  phone: string;
  service_type: string;
  wait_staff_requested?: boolean;
  primary_protein?: string;
  secondary_protein?: string;
  sides?: string[];
  special_requests?: string;
}

interface LineItem {
  id?: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface ReviewPanelProps {
  quote: Quote;
  lineItems: LineItem[];
  totals: { subtotal: number; tax_amount: number; total_amount: number };
  isGovernmentContract: boolean;
  onBack: () => void;
  onSendEstimate: () => void;
}

export function ReviewPanel({
  quote,
  lineItems,
  totals,
  isGovernmentContract,
  onBack,
  onSendEstimate
}: ReviewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Event Details</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Event:</span>
                  <span className="text-muted-foreground">{quote.event_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Type:</span>
                  <span className="text-muted-foreground capitalize">
                    {quote.event_type?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Date:</span>
                  <span className="text-muted-foreground">
                    {format(new Date(quote.event_date), 'PPP')}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Time:</span>
                  <span className="text-muted-foreground">{quote.start_time}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Guests:</span>
                  <span className="text-muted-foreground">{quote.guest_count}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Location:</span>
                  <span className="text-muted-foreground">{quote.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Details */}
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Name:</span>
                  <span className="text-muted-foreground">{quote.contact_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Email:</span>
                  <span className="text-muted-foreground">{quote.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[100px]">Phone:</span>
                  <span className="text-muted-foreground">{quote.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Menu Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Service Details</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">Service Type:</span>
                  <span className="text-muted-foreground capitalize">
                    {quote.service_type?.replace('_', ' ')}
                  </span>
                </div>
                {quote.wait_staff_requested && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Wait Staff:</span>
                    <Badge variant="secondary">Requested</Badge>
                  </div>
                )}
                {isGovernmentContract && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Contract Type:</span>
                    <Badge variant="outline">Government Contract</Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Menu Selections */}
            {(quote.primary_protein || quote.secondary_protein) && (
              <div>
                <h4 className="font-semibold mb-3">Menu</h4>
                <div className="text-sm space-y-2">
                  {quote.primary_protein && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Primary Protein:</span>
                      <span className="text-muted-foreground">{quote.primary_protein}</span>
                    </div>
                  )}
                  {quote.secondary_protein && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Secondary:</span>
                      <span className="text-muted-foreground">{quote.secondary_protein}</span>
                    </div>
                  )}
                  {quote.sides && Array.isArray(quote.sides) && quote.sides.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Sides:</span>
                      <span className="text-muted-foreground">{quote.sides.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {quote.special_requests && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Special Requests</h4>
                  <p className="text-sm text-muted-foreground">{quote.special_requests}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Pricing Summary */}
        <div>
          <h4 className="font-semibold mb-3">Pricing Summary</h4>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Line Items ({lineItems.length})</span>
              <span className="font-medium">${(totals.subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (9.5%)</span>
              <span className="font-medium">${(totals.tax_amount / 100).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${(totals.total_amount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Per Guest</span>
              <span>${(totals.total_amount / quote.guest_count / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Back to Pricing
          </Button>
          <Button onClick={onSendEstimate}>
            Send Estimate to Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
