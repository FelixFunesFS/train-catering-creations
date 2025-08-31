import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Send,
  Eye,
  Edit3,
  Mail,
  FileText,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateData: {
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
    customers: {
      name: string;
      email: string;
    };
    quote_requests: {
      event_name: string;
      event_date: string;
      location: string;
      guest_count: number;
    };
  };
  lineItems: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  onEmailSent?: () => void;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  estimateData,
  lineItems,
  onEmailSent
}: EmailPreviewModalProps) {
  const { toast } = useToast();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const isEstimate = estimateData.status === 'draft' || estimateData.status === 'estimate' || estimateData.status === 'revised';
  const documentType = isEstimate ? 'Estimate' : 'Invoice';

  useEffect(() => {
    if (isOpen) {
      // Set default subject
      setEmailSubject(`Your ${documentType} from Soul Train's Eatery - ${estimateData.quote_requests.event_name}`);
      
      // Set default message
      setEmailMessage(`Dear ${estimateData.customers.name},

Thank you for choosing Soul Train's Eatery for your upcoming event!

We're excited to cater your "${estimateData.quote_requests.event_name}" and bring authentic Southern flavors to your special occasion. Please review the attached ${documentType.toLowerCase()} details below.

${isEstimate ? 
`To proceed with booking your event, please review and approve this estimate using the link provided. We'll then send you a contract and payment information to secure your event date.` :
`Your ${documentType.toLowerCase()} is ready for payment. You can view and pay online using the link provided below.`}

If you have any questions or need to make changes, please don't hesitate to contact us. We're here to make your event memorable!

Best regards,
The Soul Train's Eatery Team
📞 (843) 970-0265
📧 soultrainseatery@gmail.com`);

      // Load email preview from edge function
      loadEmailPreview();
    }
  }, [isOpen, estimateData, documentType]);

  const loadEmailPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { 
          invoice_id: estimateData.id,
          preview_only: true // Add flag to only generate HTML without sending
        }
      });

      if (error) throw error;
      setEmailHtml(data.html || '');
    } catch (error) {
      console.error('Error loading email preview:', error);
      // Fallback to basic HTML if edge function fails
      setEmailHtml(`<div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Email Preview Loading Error</h1>
        <p>Unable to load email preview. Please try again.</p>
      </div>`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { 
          invoice_id: estimateData.id,
          custom_subject: emailSubject,
          custom_message: emailMessage
        }
      });

      if (error) throw error;

      toast({
        title: `${documentType} Sent Successfully`,
        description: `${documentType} sent to ${estimateData.customers.email}`,
      });

      onEmailSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview - {documentType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Customization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Customize Email</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isCustomizing ? 'Hide Editor' : 'Customize'}
              </Button>
            </div>

            {isCustomizing && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message</Label>
                  <Textarea
                    id="message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Enter your personal message..."
                    rows={6}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Email Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <Badge variant={isEstimate ? "default" : "secondary"}>
                {documentType}
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {isLoadingPreview ? (
                <div className="bg-white p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading email preview...</p>
                </div>
              ) : (
                <div 
                  className="bg-white"
                  dangerouslySetInnerHTML={{ __html: emailHtml }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const newWindow = window.open('', '_blank');
                  newWindow?.document.write(emailHtml);
                  newWindow?.document.close();
                }}
                disabled={isLoadingPreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview in New Tab
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : `Send ${documentType}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}