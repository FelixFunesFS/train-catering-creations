import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { StandardTermsAndConditions } from '@/components/shared/StandardTermsAndConditions';

interface TermsAndConditionsPanelProps {
  quote: any;
  invoice: any;
  onBack: () => void;
  onContinue: () => void;
}

export function TermsAndConditionsPanel({
  quote,
  invoice,
  onBack,
  onContinue
}: TermsAndConditionsPanelProps) {
  const [accepting, setAccepting] = useState(false);

  const handleAcceptTerms = async () => {
    setAccepting(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          terms_accepted_at: new Date().toISOString(),
          include_terms_and_conditions: true
        })
        .eq('id', invoice.id);

      if (error) throw error;

      toast.success('Terms & Conditions accepted');
      onContinue();
    } catch (error: any) {
      console.error('Error accepting terms:', error);
      toast.error('Failed to accept terms');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Event Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Event:</span> {quote.event_name}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span> {new Date(quote.event_date).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span> {quote.location}
              </div>
              <div>
                <span className="text-muted-foreground">Guests:</span> {quote.guest_count}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total Amount:</span> <span className="font-semibold">${(invoice.total_amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Display */}
          <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-background">
            <StandardTermsAndConditions eventType={quote.event_type} />
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              By continuing, you acknowledge that these Terms & Conditions will be included in the estimate sent to the customer.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={accepting}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button onClick={handleAcceptTerms} disabled={accepting}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {accepting ? 'Processing...' : 'Accept & Continue to Payment'}
        </Button>
      </div>
    </div>
  );
}
