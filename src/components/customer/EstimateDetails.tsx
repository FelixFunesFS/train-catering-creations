import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { UnifiedLineItemsTable } from '@/components/shared/UnifiedLineItemsTable';
import { useEstimateVersioning } from '@/hooks/useEstimateVersioning';
import { TaxCalculationService } from '@/services/TaxCalculationService';

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

  // Get versioning data to check for recent changes
  const { versions, generateLineDiff } = useEstimateVersioning({
    invoiceId: invoice.id
  });

  // Check if this estimate was just updated (status = 'sent' means admin approved changes)
  const isRecentlyUpdated = invoice.workflow_status === 'sent' && invoice.last_status_change;
  const recentUpdateDate = invoice.last_status_change 
    ? new Date(invoice.last_status_change)
    : null;
  
  // Generate change data if there are multiple versions
  const changeData = versions.length >= 2 
    ? generateLineDiff(versions[versions.length - 2], versions[versions.length - 1])
    : [];

  return (
    <div className="space-y-6">
      {/* What Changed Banner */}
      {isRecentlyUpdated && changeData.length > 0 && (
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-2">📝 Your estimate has been updated!</p>
            <p className="text-sm">
              We've reviewed your change request and updated this estimate on{' '}
              {recentUpdateDate && format(recentUpdateDate, 'MMM dd, yyyy')}. 
              Changes are highlighted below. Please review and approve if everything looks good.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Help Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Have questions or need changes?</h3>
              <p className="text-sm text-muted-foreground">
                No worries! We're here to make sure everything is perfect for your special day. 
                Use the "Request Changes" button below to let us know about menu adjustments, 
                date changes, or any special requests.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {quote.event_date ? format(new Date(quote.event_date), 'MMMM dd, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{quote.start_time || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{quote.location || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Guest Count</p>
                <p className="text-sm text-muted-foreground">{quote.guest_count || 0} guests</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items - Unified Table with Change Highlighting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🍴 Your Soul Food Menu
          </CardTitle>
          <p className="text-sm text-muted-foreground italic">
            Prepared fresh with love, just like Grandma used to make
          </p>
          {changeData.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {changeData.filter(c => c.type === 'added').length > 0 && 
                `✨ ${changeData.filter(c => c.type === 'added').length} new item(s) · `}
              {changeData.filter(c => c.type === 'modified').length > 0 && 
                `📝 ${changeData.filter(c => c.type === 'modified').length} modified · `}
              {changeData.filter(c => c.type === 'removed').length > 0 && 
                `❌ ${changeData.filter(c => c.type === 'removed').length} removed`}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate totals from line items (single source of truth)
            const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
            const isGovContract = quote.compliance_level === 'government' || quote.requires_po_number;
            const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);
            
            return (
              <UnifiedLineItemsTable
                items={lineItems}
                mode="view"
                changeData={changeData}
                subtotal={taxCalc.subtotal}
                taxAmount={taxCalc.taxAmount}
                totalAmount={taxCalc.totalAmount}
                groupByCategory={true}
              />
            );
          })()}
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
