import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Loader2, 
  CheckCircle, 
  Send, 
  DollarSign,
  ArrowRight 
} from 'lucide-react';

interface OneClickProcessingProps {
  quote: any;
  onSuccess: () => void;
}

export function OneClickProcessing({ quote, onSuccess }: OneClickProcessingProps) {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'idle' | 'creating' | 'sending' | 'payment' | 'complete'>('idle');
  const { toast } = useToast();

  const processQuote = async () => {
    setProcessing(true);
    setStep('creating');

    try {
      // Step 1: Create estimate
      const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quote.id }
      });

      if (invoiceError) throw invoiceError;
      
      setStep('sending');
      
      // Step 2: Send estimate to customer
      const { error: emailError } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: invoiceData.invoice_id,
          custom_subject: `Your Estimate - ${quote.event_name}`,
          custom_message: `Dear ${quote.contact_name},\n\nThank you for considering Soul Train's Eatery for your upcoming ${quote.event_name}. Please review the attached estimate and let us know if you have any questions.\n\nBest regards,\nSoul Train's Eatery Team`
        }
      });

      if (emailError) throw emailError;

      setStep('payment');

      // Step 3: Create payment link
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: invoiceData.invoice_id,
          amount: invoiceData.total_amount,
          customer_email: quote.email,
          description: `Payment for ${quote.event_name}`
        }
      });

      if (paymentError) throw paymentError;

      // Copy payment link to clipboard
      await navigator.clipboard.writeText(paymentData.url);

      setStep('complete');

      toast({
        title: "Quote processed successfully!",
        description: "Estimate sent and payment link copied to clipboard",
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Error processing quote:', error);
      toast({
        title: "Processing failed",
        description: "Please try again or process manually",
        variant: "destructive"
      });
      setStep('idle');
    } finally {
      setProcessing(false);
    }
  };

  const getStepInfo = () => {
    switch (step) {
      case 'creating':
        return { label: 'Creating estimate...', icon: Loader2, color: 'text-blue-600' };
      case 'sending':
        return { label: 'Sending to customer...', icon: Send, color: 'text-orange-600' };
      case 'payment':
        return { label: 'Creating payment link...', icon: DollarSign, color: 'text-green-600' };
      case 'complete':
        return { label: 'Complete!', icon: CheckCircle, color: 'text-green-600' };
      default:
        return { label: 'One-Click Process', icon: Zap, color: 'text-primary' };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Smart Processing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepIcon className={`h-4 w-4 ${stepInfo.color} ${processing && step !== 'complete' ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{stepInfo.label}</span>
            </div>
            {step === 'complete' && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Complete
              </Badge>
            )}
          </div>

          {step === 'idle' && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                This will automatically:
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  Create professional estimate
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  Email to customer
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  Generate payment link
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={processQuote}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Process Quote (1-Click)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}