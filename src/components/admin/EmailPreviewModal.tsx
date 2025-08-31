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
  const [isSending, setIsSending] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

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
    }
  }, [isOpen, estimateData, documentType]);

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

  const generateEmailHTML = () => {
    const baseUrl = window.location.origin;
    const previewUrl = `${baseUrl}/estimate-preview/${estimateData.id}`;
    
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Soul Train's Eatery</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Authentic Southern Catering • Charleston's Lowcountry</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <!-- Personal Message -->
          <div style="white-space: pre-line; line-height: 1.6; margin-bottom: 24px; color: #374151;">
            ${emailMessage.replace(/\n/g, '<br>')}
          </div>

          <!-- Event Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${documentType} Details</h3>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #8B4513; font-weight: 500;">📅 Event:</span>
                <span style="color: #374151;">${estimateData.quote_requests.event_name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #8B4513; font-weight: 500;">📍 Date:</span>
                <span style="color: #374151;">${formatDate(estimateData.quote_requests.event_date)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #8B4513; font-weight: 500;">🏢 Location:</span>
                <span style="color: #374151;">${estimateData.quote_requests.location}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #8B4513; font-weight: 500;">👥 Guests:</span>
                <span style="color: #374151;">${estimateData.quote_requests.guest_count} people</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #8B4513; font-weight: 500;">💰 Total:</span>
                <span style="color: #374151; font-size: 18px; font-weight: 600;">${formatCurrency(estimateData.total_amount)}</span>
              </div>
            </div>
          </div>

          <!-- Menu Items -->
          <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 16px; font-weight: 600;">Menu & Services</h3>
            ${lineItems.map(item => `
              <div style="display: flex; justify-content: between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fed7aa;">
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #92400e;">${item.title}</div>
                  <div style="font-size: 14px; color: #a16207; margin-top: 2px;">${item.description}</div>
                </div>
                <div style="text-align: right; color: #92400e; font-weight: 500;">
                  ${item.quantity > 1 ? `${item.quantity} × ` : ''}${formatCurrency(item.total_price)}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${previewUrl}" style="
              background: linear-gradient(135deg, ${isEstimate ? '#16a34a' : '#2563eb'} 0%, ${isEstimate ? '#22c55e' : '#3b82f6'} 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
              ${isEstimate ? `Review & Approve ${documentType}` : `View ${documentType} & Pay`}
            </a>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
              Click the button above to view the full details and ${isEstimate ? 'approve your estimate' : 'process payment'}
            </p>
          </div>

          <!-- Contact Info -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <h4 style="margin: 0 0 12px 0; color: #334155;">Questions? We're Here to Help!</h4>
            <div style="color: #64748b; font-size: 14px;">
              <div style="margin: 4px 0;">📞 (843) 970-0265</div>
              <div style="margin: 4px 0;">📧 soultrainseatery@gmail.com</div>
              <div style="margin: 8px 0; font-style: italic;">Proudly serving Charleston's Lowcountry and surrounding areas</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; margin-top: 32px;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Soul Train's Eatery - Bringing People Together Around Exceptional Food<br>
              Family-Run • Authentic Southern Cooking • Charleston, SC
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { 
          invoice_id: estimateData.id,
          custom_subject: emailSubject,
          custom_message: emailMessage,
          email_html: generateEmailHTML()
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent Successfully",
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
              <div 
                className="bg-white"
                dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
              />
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
                  newWindow?.document.write(generateEmailHTML());
                  newWindow?.document.close();
                }}
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