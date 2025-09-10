import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { 
  Zap, 
  Loader2, 
  CheckCircle, 
  Send, 
  DollarSign,
  ArrowRight,
  Edit3,
  Eye
} from 'lucide-react';

interface EnhancedOneClickProcessingProps {
  quote: any;
  onSuccess: () => void;
}

export function EnhancedOneClickProcessing({ quote, onSuccess }: EnhancedOneClickProcessingProps) {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'idle' | 'pricing' | 'creating' | 'sending' | 'payment' | 'complete'>('idle');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(quote.estimated_total || 0);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const { toast } = useToast();

  const initializeEmailContent = () => {
    const defaultSubject = `Your Estimate - ${quote.event_name}`;
    const defaultMessage = `Dear ${quote.contact_name},

Thank you for considering Soul Train's Eatery for your upcoming ${quote.event_name}. We're excited about the opportunity to cater your special event!

Our family-run business takes pride in bringing people together around exceptional Southern food. Please review the detailed estimate below, which includes all the services and menu items you've requested.

If you have any questions or would like to make adjustments, please don't hesitate to reach out. We're here to make your event memorable and delicious.

Best regards,
Soul Train's Eatery Team
(843) 970-0265
soultrainseatery@gmail.com`;

    setEmailSubject(defaultSubject);
    setEmailMessage(defaultMessage);
  };

  const handleStartProcess = () => {
    if (estimatedTotal <= 0) {
      setShowPricingModal(true);
      return;
    }
    proceedWithProcess();
  };

  const proceedWithProcess = async () => {
    setProcessing(true);
    setStep('creating');

    try {
      // Step 1: Create estimate with manual pricing
      const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { 
          quote_request_id: quote.id,
          manual_total: estimatedTotal
        }
      });

      if (invoiceError) throw invoiceError;
      
      setGeneratedInvoice(invoiceData);
      setStep('sending');
      
      // Initialize email content and show email customization
      initializeEmailContent();
      setShowEmailModal(true);
      setProcessing(false);

    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "Failed to create estimate",
        description: "Please try again or process manually",
        variant: "destructive"
      });
      setStep('idle');
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedInvoice) return;

    setProcessing(true);
    setStep('sending');

    try {
      // Step 2: Send customized estimate to customer
      const { error: emailError } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: generatedInvoice.invoice_id,
          custom_subject: emailSubject,
          custom_message: emailMessage
        }
      });

      if (emailError) throw emailError;

      setStep('payment');

      // Step 3: Create payment link
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: generatedInvoice.invoice_id,
          amount: generatedInvoice.total_amount,
          customer_email: quote.email,
          description: `Payment for ${quote.event_name}`
        }
      });

      if (paymentError) throw paymentError;

      // Copy payment link to clipboard
      await navigator.clipboard.writeText(paymentData.url);

      setStep('complete');
      setShowEmailModal(false);

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
      case 'pricing':
        return { label: 'Set pricing...', icon: Edit3, color: 'text-blue-600' };
      case 'creating':
        return { label: 'Creating estimate...', icon: Loader2, color: 'text-blue-600' };
      case 'sending':
        return { label: 'Sending to customer...', icon: Send, color: 'text-orange-600' };
      case 'payment':
        return { label: 'Creating payment link...', icon: DollarSign, color: 'text-green-600' };
      case 'complete':
        return { label: 'Complete!', icon: CheckCircle, color: 'text-green-600' };
      default:
        return { label: 'Smart Processing', icon: Zap, color: 'text-primary' };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Enhanced Smart Processing
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Total (Override)</label>
                  <Input
                    type="number"
                    value={estimatedTotal / 100}
                    onChange={(e) => setEstimatedTotal(Math.round(parseFloat(e.target.value || '0') * 100))}
                    placeholder="Enter custom pricing"
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Leave blank to use auto-generated pricing
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  This will automatically:
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Create professional estimate with grouped line items
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Allow email customization and preview
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Send to customer and generate payment link
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleStartProcess}
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
                  Process Quote (Enhanced)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Override Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Custom Pricing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Total Amount</label>
              <Input
                type="number"
                value={estimatedTotal / 100}
                onChange={(e) => setEstimatedTotal(Math.round(parseFloat(e.target.value || '0') * 100))}
                placeholder="Enter total amount"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPricingModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowPricingModal(false);
                proceedWithProcess();
              }}>
                Continue with {formatCurrency(estimatedTotal / 100)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Customization Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Email Before Sending</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Customization */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Your custom message to the customer"
                  rows={12}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Email Preview
              </h3>
              <div className="border rounded-lg p-4 bg-background min-h-[300px]">
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h1 className="text-xl font-bold text-primary">Soul Train's Eatery</h1>
                    <p className="text-sm text-muted-foreground">Authentic Southern Catering</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-primary border-b pb-2">
                      {emailSubject}
                    </h2>
                  </div>
                  
                  <div className="whitespace-pre-line text-sm">
                    {emailMessage}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Event Details</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Event:</strong> {quote.event_name}</p>
                      <p><strong>Date:</strong> {new Date(quote.event_date).toLocaleDateString()}</p>
                      <p><strong>Guests:</strong> {quote.guest_count}</p>
                      <p><strong>Location:</strong> {quote.location}</p>
                    </div>
                  </div>
                  
                  {generatedInvoice && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Estimate Summary</h3>
                      <div className="text-lg font-semibold text-primary">
                        Total: {formatCurrency((generatedInvoice.total_amount || estimatedTotal) / 100)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={processing}>
              {processing ? 'Sending...' : 'Send Estimate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}