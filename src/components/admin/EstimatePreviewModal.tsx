import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Mail, Eye, Send, Edit3 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: any;
  quote: any;
  onEmailSent?: () => void;
}

export function EstimatePreviewModal({
  isOpen,
  onClose,
  estimate,
  quote,
  onEmailSent
}: EstimatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { toast } = useToast();

  // Initialize email content when modal opens
  useEffect(() => {
    if (isOpen && estimate && quote) {
      const defaultSubject = `Your ${estimate.event_details?.name || 'Event'} Estimate - Soul Train's Eatery`;
      const defaultMessage = `Dear ${estimate.customer_name},

Thank you for considering Soul Train's Eatery for your upcoming ${estimate.event_details?.name || 'event'}. We're excited to be part of your special day!

Please review the attached estimate for catering services. We've carefully crafted a menu that will bring authentic Southern flavors to your celebration.

If you have any questions or would like to make adjustments, please don't hesitate to reach out. We're here to make your event memorable.

Best regards,
Soul Train's Eatery Team
(843) 970-0265
soultrainseatery@gmail.com`;

      setEmailSubject(defaultSubject);
      setEmailMessage(defaultMessage);
      loadEmailPreview(defaultSubject, defaultMessage);
    }
  }, [isOpen, estimate, quote]);

  const loadEmailPreview = async (subject?: string, message?: string) => {
    if (!estimate || !quote) return;

    setIsLoadingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: estimate.quote_request_id, // Use quote ID for preview
          preview_only: true,
          custom_subject: subject || emailSubject,
          custom_message: message || emailMessage,
          estimate_data: estimate,
          quote_data: quote
        }
      });

      if (error) throw error;
      setEmailPreview(data.html || generateFallbackPreview());
    } catch (error) {
      console.error('Error loading email preview:', error);
      setEmailPreview(generateFallbackPreview());
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const generateFallbackPreview = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B4513; margin: 0;">Soul Train's Eatery</h1>
          <p style="color: #666; margin: 5px 0;">Authentic Southern Catering</p>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">
          Estimate for ${estimate?.event_details?.name || 'Your Event'}
        </h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Event Details</h3>
          <p><strong>Date:</strong> ${format(new Date(estimate?.event_details?.date), 'PPP')}</p>
          <p><strong>Location:</strong> ${estimate?.event_details?.location}</p>
          <p><strong>Guests:</strong> ${estimate?.event_details?.guest_count}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #8B4513;">Your Custom Message</h3>
          <div style="white-space: pre-line; line-height: 1.6;">${emailMessage}</div>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
          <h3 style="color: #8B4513; margin-top: 0;">Estimate Summary</h3>
          ${estimate?.line_items?.map((item: any) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <span>${item.title} (${item.quantity}x)</span>
              <span>${formatCurrency(item.total_price / 100)}</span>
            </div>
          `).join('') || ''}
          <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 1.1em; border-top: 2px solid #8B4513; margin-top: 10px;">
            <span>Total Amount</span>
            <span>${formatCurrency((estimate?.total_amount || 0) / 100)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f8ff; border-radius: 5px;">
          <p style="margin: 0; color: #333;">
            <strong>Ready to move forward?</strong><br>
            Contact us at (843) 970-0265 or soultrainseatery@gmail.com
          </p>
        </div>
      </div>
    `;
  };

  const handleSendEmail = async () => {
    if (!estimate || !quote) return;

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: estimate.quote_request_id,
          custom_subject: emailSubject,
          custom_message: emailMessage,
          estimate_data: estimate,
          quote_data: quote
        }
      });

      if (error) throw error;

      toast({
        title: 'Email sent successfully',
        description: `Estimate sent to ${estimate.customer_email}`,
      });

      onEmailSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Failed to send email',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePreviewInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(emailPreview);
      newWindow.document.close();
    }
  };

  if (!estimate || !quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Estimate Preview & Email</DialogTitle>
          <DialogDescription>
            Preview your estimate and customize the email before sending to {estimate.customer_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Estimate Preview
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Customization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Estimate #{estimate.quote_request_id?.slice(-8) || 'NEW'}</CardTitle>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Customer</h4>
                      <p className="font-medium">{estimate.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{estimate.customer_email}</p>
                      <p className="text-sm text-muted-foreground">{estimate.customer_phone}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Event Details</h4>
                      <p className="font-medium">{estimate.event_details?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(estimate.event_details?.date), 'PPP')} • {estimate.event_details?.guest_count} guests
                      </p>
                      <p className="text-sm text-muted-foreground">{estimate.event_details?.location}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Line Items */}
                  <div>
                    <h4 className="font-semibold mb-4">Services & Items</h4>
                    <div className="space-y-2">
                      {estimate.line_items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-border/50">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.unit_price / 100)}
                            </p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.total_price / 100)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency((estimate.subtotal || 0) / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency((estimate.tax_amount || 0) / 100)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency((estimate.total_amount || 0) / 100)}</span>
                    </div>
                    {estimate.deposit_required > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Deposit Required</span>
                        <span>{formatCurrency(estimate.deposit_required / 100)}</span>
                      </div>
                    )}
                  </div>

                  {estimate.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm">{estimate.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="email" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Email Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Email Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <Button
                    onClick={() => loadEmailPreview()}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingPreview}
                  >
                    {isLoadingPreview ? 'Updating...' : 'Update Preview'}
                  </Button>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded-lg p-4 h-96 overflow-y-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: emailPreview }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handlePreviewInNewTab}>
              Preview in New Tab
            </Button>
          </div>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Estimate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}