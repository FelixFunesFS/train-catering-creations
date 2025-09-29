import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Eye, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  body_template: string;
  template_type: string;
}

interface UnifiedEmailReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailType: 'estimate' | 'follow-up' | 'reminder' | 'contract' | 'payment';
  invoice?: any;
  quoteRequest?: any;
  lineItems?: any[];
  onEmailSent?: () => void;
}

export function UnifiedEmailReviewModal({
  isOpen,
  onClose,
  emailType,
  invoice,
  quoteRequest,
  lineItems = [],
  onEmailSent
}: UnifiedEmailReviewModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { toast } = useToast();

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadEmailTemplates();
    }
  }, [isOpen, emailType]);

  // Generate email content when template changes
  useEffect(() => {
    if (selectedTemplate && quoteRequest) {
      generateEmailContent();
    }
  }, [selectedTemplate, quoteRequest, invoice]);

  const loadEmailTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', emailType)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      
      // Auto-select default template
      const defaultTemplate = data?.find(t => t.is_default) || data?.[0];
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to default templates
      generateDefaultTemplate();
    }
  };

  const generateDefaultTemplate = () => {
    const defaultTemplates = {
      estimate: {
        subject: `Catering Estimate for ${quoteRequest?.event_name}`,
        body: `Hello ${quoteRequest?.contact_name},

Thank you for considering Soul Train's Eatery for your upcoming event. Please find your customized catering estimate below.

We're excited about the opportunity to serve you and your guests with our authentic Southern cuisine that brings people together around exceptional food.

Event Details:
• ${quoteRequest?.event_name}
• ${new Date(quoteRequest?.event_date).toLocaleDateString()}
• ${quoteRequest?.guest_count} guests
• ${quoteRequest?.location}

Next Steps:
1. Review the attached estimate
2. Contact us with any questions or changes
3. Approve the estimate to secure your date

Best regards,
Soul Train's Eatery Team
Phone: (843) 970-0265
Email: soultrainseatery@gmail.com`
      },
      'follow-up': {
        subject: `Following up on your catering estimate - ${quoteRequest?.event_name}`,
        body: `Hello ${quoteRequest?.contact_name},

I hope this message finds you well. I wanted to follow up on the catering estimate we sent for your ${quoteRequest?.event_name} event.

Have you had a chance to review the proposal? I'm here to answer any questions you might have about our menu, pricing, or services.

Your event date is approaching, and we'd love to help make it memorable with our delicious Southern cuisine.

Please feel free to reach out with any questions or if you'd like to move forward with booking.

Best regards,
Soul Train's Eatery Team`
      }
    };

    const template = defaultTemplates[emailType];
    if (template) {
      setCustomSubject(template.subject);
      setCustomMessage(template.body);
    }
  };

  const generateEmailContent = async () => {
    if (!selectedTemplate || !quoteRequest) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Replace template variables
    const subject = template.subject_template
      .replace('{{event_name}}', quoteRequest.event_name || '')
      .replace('{{contact_name}}', quoteRequest.contact_name || '');

    const body = template.body_template
      .replace('{{contact_name}}', quoteRequest.contact_name || '')
      .replace('{{event_name}}', quoteRequest.event_name || '')
      .replace('{{event_date}}', new Date(quoteRequest.event_date).toLocaleDateString())
      .replace('{{guest_count}}', quoteRequest.guest_count?.toString() || '')
      .replace('{{location}}', quoteRequest.location || '');

    setCustomSubject(subject);
    setCustomMessage(body);
  };

  const loadEmailPreview = async () => {
    if (!invoice?.id) return;

    setLoadingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: invoice.id,
          custom_subject: customSubject,
          custom_message: customMessage,
          preview_only: true
        }
      });

      if (error) throw error;
      setEmailPreview(data.html || '');
    } catch (error) {
      console.error('Error loading preview:', error);
      setEmailPreview('<p>Preview unavailable</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Load preview when content changes
  useEffect(() => {
    if (customSubject && customMessage && invoice?.id) {
      const timeoutId = setTimeout(loadEmailPreview, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [customSubject, customMessage, invoice?.id]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: invoice?.id,
          custom_subject: customSubject,
          custom_message: customMessage
        }
      });

      if (error) throw error;

      // Update invoice status
      if (invoice?.id) {
        await supabase
          .from('invoices')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            status_changed_by: 'admin'
          })
          .eq('id', invoice.id);
      }

      // Update quote status
      if (quoteRequest?.id) {
        await supabase
          .from('quote_requests')
          .update({ status: 'quoted' })
          .eq('id', quoteRequest.id);
      }

      toast({
        title: "Email Sent Successfully!",
        description: `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} has been sent to ${quoteRequest?.email}`,
      });

      onEmailSent?.();
      onClose();

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const openPreviewInNewTab = () => {
    if (emailPreview) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(emailPreview);
        newWindow.document.close();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Review & Send {emailType.charAt(0).toUpperCase() + emailType.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Email Customization */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customize Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.length > 0 && (
                  <div>
                    <Label htmlFor="template">Email Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                            {template.is_default && <Badge variant="secondary" className="ml-2">Default</Badge>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Email Message</Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={12}
                    placeholder="Enter your message"
                  />
                </div>

                {/* Email Info */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To:</span>
                    <span>{quoteRequest?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From:</span>
                    <span>soultrainseatery@gmail.com</span>
                  </div>
                  {invoice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(invoice.total_amount / 100)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Preview */}
          <div className="space-y-4 overflow-y-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </span>
                  {emailPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openPreviewInNewTab}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      New Tab
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPreview ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : emailPreview ? (
                  <div 
                    className="border rounded-lg p-4 bg-white text-sm overflow-auto max-h-96"
                    dangerouslySetInnerHTML={{ __html: emailPreview }}
                  />
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/30 text-center h-64 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      Preview will appear here once content is ready
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSendEmail}
              disabled={sending || !customSubject || !customMessage}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {emailType.charAt(0).toUpperCase() + emailType.slice(1)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}