import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Copy, ExternalLink, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
  customerEmail?: string;
  invoiceNumber: string;
  amount: number;
}

export function PaymentLinkModal({ 
  isOpen, 
  onClose, 
  paymentUrl, 
  customerEmail, 
  invoiceNumber,
  amount 
}: PaymentLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleOpenLink = () => {
    window.open(paymentUrl, '_blank');
  };

  const handleEmailCustomer = () => {
    if (customerEmail) {
      const subject = `Payment Link for Invoice ${invoiceNumber}`;
      const body = `Dear Customer,

Please use the following secure link to make your payment for Invoice ${invoiceNumber}:

${paymentUrl}

Amount Due: ${formatCurrency(amount)}

Thank you for your business!

Best regards,
Soul Train's Eatery`;
      
      const mailtoUrl = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Payment Link Created Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Invoice:</span>
                  <p className="font-semibold">{invoiceNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Amount:</span>
                  <p className="font-semibold text-green-600">{formatCurrency(amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share this secure payment link with your customer:</label>
            <div className="flex gap-2">
              <Input 
                value={paymentUrl} 
                readOnly 
                className="font-mono text-sm bg-muted"
              />
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleOpenLink} variant="default" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Payment Page
            </Button>
            
            {customerEmail && (
              <Button onClick={handleEmailCustomer} variant="secondary" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email to Customer
              </Button>
            )}
            
            <Button onClick={onClose} variant="outline">
              Done
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Share the payment link with your customer via email, text, or your preferred method</li>
              <li>• Customers can pay securely using their credit card or bank account</li>
              <li>• You'll receive automatic notifications when payment is completed</li>
              <li>• The link remains active until the invoice is paid</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}