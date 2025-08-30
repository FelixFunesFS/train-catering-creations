import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Calendar,
  DollarSign,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface CustomerApprovalTrackerProps {
  quote: any;
  onConfirm: () => void;
  loading: boolean;
}

export function CustomerApprovalTracker({ quote, onConfirm, loading }: CustomerApprovalTrackerProps) {
  const isApproved = quote?.workflow_status === 'approved';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Customer Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approval Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {isApproved ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Clock className="h-6 w-6 text-yellow-600" />
            )}
            <div>
              <h4 className="font-medium">
                {isApproved ? 'Quote Approved' : 'Awaiting Customer Response'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isApproved 
                  ? 'Customer has approved the quote and is ready to proceed'
                  : 'Quote sent to customer, waiting for approval decision'
                }
              </p>
            </div>
          </div>
          <Badge variant={isApproved ? 'default' : 'secondary'}>
            {isApproved ? 'Approved' : 'Pending'}
          </Badge>
        </div>

        {/* Quote Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Event Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(quote.event_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-sm text-muted-foreground">
                ${(quote.estimated_total / 100).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Service Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {quote.service_type?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        {isApproved ? (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Customer has approved the quote. You can now proceed to confirm the event details and begin execution planning.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={onConfirm}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {loading ? 'Confirming...' : 'Confirm Event & Start Planning'}
            </Button>
          </div>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Waiting for customer to approve the quote. They can:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Approve the quote via their customer portal</li>
                  <li>Contact you directly with questions or changes</li>
                  <li>Request modifications to the quote</li>
                </ul>
                <p className="text-sm font-medium mt-3">
                  No admin action required at this time.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Override Option */}
        {!isApproved && (
          <div className="pt-4 border-t">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Manual Override
            </h5>
            <p className="text-sm text-muted-foreground mb-3">
              If the customer approved via phone, email, or other direct communication, you can manually mark this quote as approved.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // This would trigger a manual approval action
                console.log('Manual approval override');
              }}
            >
              Mark as Manually Approved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}