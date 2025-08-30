import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  totalAmount: number;
  paymentType: 'deposit' | 'full' | 'remaining';
}

export function PaymentTermsModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  totalAmount, 
  paymentType 
}: PaymentTermsModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRefund, setAcceptedRefund] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getPaymentTerms = () => {
    const depositAmount = Math.round(totalAmount * 0.5);
    const remainingAmount = totalAmount - depositAmount;

    switch (paymentType) {
      case 'deposit':
        return {
          title: 'Deposit Payment Terms',
          amount: depositAmount,
          description: `You are paying a ${formatCurrency(depositAmount)} deposit (50% of total). The remaining balance of ${formatCurrency(remainingAmount)} will be due 48 hours before your event.`
        };
      case 'full':
        return {
          title: 'Full Payment Terms',
          amount: totalAmount,
          description: `You are paying the full amount of ${formatCurrency(totalAmount)} for your catering service.`
        };
      case 'remaining':
        return {
          title: 'Final Payment Terms',
          amount: totalAmount - depositAmount,
          description: `You are completing your payment with the remaining balance.`
        };
    }
  };

  const terms = getPaymentTerms();
  const canProceed = acceptedTerms && acceptedRefund;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {terms.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(terms.amount)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {terms.description}
              </p>
            </div>

            {/* Payment Terms */}
            <div className="space-y-4">
              <h3 className="font-semibold">Payment Terms & Conditions</h3>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 border-l-4 border-primary bg-muted/30">
                  <h4 className="font-medium">Deposit Requirements</h4>
                  <p className="text-muted-foreground mt-1">
                    A 50% deposit is required to secure your event date. This deposit is non-refundable 
                    unless cancellation occurs more than 30 days before the event.
                  </p>
                </div>

                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <h4 className="font-medium">Final Payment</h4>
                  <p className="text-muted-foreground mt-1">
                    Final payment is due 48 hours before your event. Failure to pay the remaining 
                    balance may result in cancellation of catering services.
                  </p>
                </div>

                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-medium">Payment Methods</h4>
                  <p className="text-muted-foreground mt-1">
                    We accept all major credit cards, debit cards, and ACH transfers through our 
                    secure payment processor. All payments are processed immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-4">
              <h3 className="font-semibold">Cancellation & Refund Policy</h3>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-green-600">30+ Days Notice</h4>
                    <p className="text-muted-foreground mt-1">Full refund of deposit</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-orange-600">14-29 Days Notice</h4>
                    <p className="text-muted-foreground mt-1">50% refund of deposit</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-red-600">7-13 Days Notice</h4>
                    <p className="text-muted-foreground mt-1">25% refund of deposit</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-red-600">Less than 7 Days</h4>
                    <p className="text-muted-foreground mt-1">No refund</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Terms */}
            <div className="space-y-4">
              <h3 className="font-semibold">Service Agreement</h3>
              <div className="text-sm space-y-2">
                <p>
                  • Menu changes must be finalized at least 7 days before the event
                </p>
                <p>
                  • Guest count changes affecting pricing must be confirmed 72 hours in advance
                </p>
                <p>
                  • Setup requires access to venue 2 hours before service time
                </p>
                <p>
                  • Additional fees may apply for special dietary requirements or last-minute changes
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          {/* Agreement Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read and agree to the{' '}
                <Link 
                  to="/terms-conditions" 
                  target="_blank"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Terms & Conditions
                  <ExternalLink className="h-3 w-3" />
                </Link>
                {' '}and payment terms outlined above.
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="refund" 
                checked={acceptedRefund}
                onCheckedChange={(checked) => setAcceptedRefund(checked === true)}
              />
              <label htmlFor="refund" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand and accept the cancellation and refund policy as outlined above.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAccept} 
              disabled={!canProceed}
              className="min-w-[120px]"
            >
              <Check className="h-4 w-4 mr-2" />
              Agree & Pay {formatCurrency(terms.amount)}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}