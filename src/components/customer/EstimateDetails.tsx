import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EstimateDetailsProps {
  invoice: any;
  quote: any;
  lineItems: any[];
  milestones: any[];
}

export function EstimateDetails({ invoice, quote, lineItems, milestones }: EstimateDetailsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const groupedItems = lineItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(quote.event_date), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{quote.start_time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{quote.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Guest Count</p>
                <p className="text-sm text-muted-foreground">{quote.guest_count} guests</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Estimate Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]: [string, any[]]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.title || item.description}</p>
                      {item.title && item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}

          {/* Totals */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{milestone.description || `Payment ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.percentage}% of total
                      {milestone.due_date && ` - Due ${format(new Date(milestone.due_date), 'MMM dd, yyyy')}`}
                    </p>
                  </div>
                  <Badge variant={milestone.status === 'paid' ? 'default' : 'outline'}>
                    {formatCurrency(milestone.amount_cents)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
