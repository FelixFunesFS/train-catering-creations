import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';
import { XCircle, Home, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentCanceled() {
  const [searchParams] = useSearchParams();
  const milestoneId = searchParams.get('milestone_id');

  const handleRetryPayment = () => {
    // This would typically redirect back to the payment flow
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-600">Payment Canceled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your payment was canceled and no charges were made to your account. Your event booking is still pending payment.
            </AlertDescription>
          </Alert>

          {milestoneId && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Type:</span>
                <Badge variant="outline">Milestone Payment</Badge>
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you experienced any issues during the payment process or have questions about your event, we're here to help.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your internet connection and try again</li>
              <li>• Verify your payment method details</li>
              <li>• Contact us if you continue to experience issues</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleRetryPayment}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
            
            <Button 
              variant="outline"
              className="w-full" 
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Questions or need assistance?
              </p>
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Soul Train's Eatery</span>
                <span>Phone: (843) 970-0265</span>
                <span>Email: soultrainseatery@gmail.com</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We're available to help with payment issues and answer any questions about your catering event.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}