import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChangeRequest } from '@/hooks/useChangeRequest';
import { CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

interface EstimateActionsProps {
  invoiceId: string;
  customerEmail: string;
  status: string;
  onChangeRequested?: () => void;
  onEstimateAccepted?: () => void;
}

export function EstimateActions({ 
  invoiceId, 
  customerEmail, 
  status, 
  onChangeRequested,
  onEstimateAccepted 
}: EstimateActionsProps) {
  const { acceptEstimate, submitting } = useChangeRequest(invoiceId, customerEmail);

  const handleAccept = async () => {
    try {
      await acceptEstimate();
      onEstimateAccepted?.();
    } catch (error) {
      // Error already handled by useChangeRequest
    }
  };

  // Show confirmation for change requests
  if (status === 'change_requested') {
    return null; // Handled by parent component
  }

  if (status === 'approved') {
    return (
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Estimate Accepted</CardTitle>
          </div>
          <CardDescription>
            Thank you for accepting this estimate. We'll be in touch soon!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
        <CardDescription>
          Please review the estimate above and let us know if you'd like to proceed or make any changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleAccept}
          disabled={submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Accept This Estimate
        </Button>

        <Button
          variant="outline"
          className="w-full border-2 hover:bg-primary/5 hover:border-primary transition-all"
          size="lg"
          onClick={onChangeRequested}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          <span className="font-semibold">Request Changes</span>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Need menu adjustments, date changes, or have special requests? We're happy to help!
        </p>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Questions? Contact us at <strong>soultrainseatery@gmail.com</strong> or <strong>(843) 970-0265</strong>
        </p>
      </CardContent>
    </Card>
  );
}
