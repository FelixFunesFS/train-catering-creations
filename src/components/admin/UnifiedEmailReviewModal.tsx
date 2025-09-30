import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Eye, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  template_type: string;
  is_default?: boolean;
  is_active?: boolean;
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
      const response = await supabase
        .from('email_templates')
        .select('id, template_name, subject_template, body_template, template_type, is_default')
        .eq('template_type', emailType)
        .order('is_default', { ascending: false });

      if (response.error) throw response.error;

      if (response.data && response.data.length > 0) {
        const templateData = response.data.map(template => ({
          id: template.id,
          template_name: template.template_name,
          subject_template: template.subject_template,
          body_template: template.body_template,
          template_type: template.template_type,
          is_default: template.is_default || false,
          is_active: true
        }));
        
        setTemplates(templateData);
        
        // Auto-select default template
        const defaultTemplate = templateData.find(t => t.is_default) || templateData[0];
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
        }
      } else {
        // Fallback to default templates
        generateDefaultTemplate();
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to default templates
      generateDefaultTemplate();
    }
  };

  const generateDefaultTemplate = () => {
    const defaultTemplates: Record<string, { subject: string; body: string }> = {
      estimate: {
        subject: `Catering Estimate for ${quoteRequest?.event_name || 'Your Event'}`,
        body: `Hello ${quoteRequest?.contact_name || 'Customer'},

Thank you for considering Soul Train's Eatery for your upcoming event. Please find your customized catering estimate below.

Event Details:
• ${quoteRequest?.event_name || 'Event'}
• ${quoteRequest?.event_date ? new Date(quoteRequest.event_date).toLocaleDateString() : 'Date TBD'}
• ${quoteRequest?.guest_count || 0} guests
• ${quoteRequest?.location || 'Location TBD'}

Best regards,
Soul Train's Eatery Team
Phone: (843) 970-0265
Email: soultrainseatery@gmail.com`
      },
      'follow-up': {
        subject: `Following up on your catering estimate - ${quoteRequest?.event_name || 'Your Event'}`,
        body: `Hello ${quoteRequest?.contact_name || 'Customer'},

I hope this message finds you well. I wanted to follow up on the catering estimate we sent for your event.

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
      .replace(/\{\{event_name\}\}/g, quoteRequest.event_name || '')
      .replace(/\{\{contact_name\}\}/g, quoteRequest.contact_name || '');

    const body = template.body_template
      .replace(/\{\{contact_name\}\}/g, quoteRequest.contact_name || '')
      .replace(/\{\{event_name\}\}/g, quoteRequest.event_name || '')
      .replace(/\{\{event_date\}\}/g, quoteRequest.event_date ? new Date(quoteRequest.event_date).toLocaleDateString() : '')
      .replace(/\{\{guest_count\}\}/g, quoteRequest.guest_count?.toString() || '')
      .replace(/\{\{location\}\}/g, quoteRequest.location || '');

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
      setEmailPreview(data?.html || '');
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
    // Validate required data
    if (!invoice || !quoteRequest) {
      toast({
        title: "Error",
        description: "Missing invoice or quote request data",
        variant: "destructive",
      });
      return;
    }

    // Validate customer email
    if (!quoteRequest.email) {
      toast({
        title: "Email Error",
        description: "Customer email is missing. Cannot send estimate.",
        variant: "destructive",
      });
      return;
    }

    // Validate pricing
    if (!invoice.total_amount || invoice.total_amount === 0) {
      toast({
        title: "Validation Error",
        description: "Invoice total is zero. Please review pricing before sending.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      console.log('Sending email to:', quoteRequest.email, 'for invoice:', invoice.id);
      
      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: invoice.id,
          custom_subject: customSubject,
          custom_message: customMessage
        }
      });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          status_changed_by: 'admin'
        })
        .eq('id', invoice.id);

      // Update quote status
      await supabase
        .from('quote_requests')
        .update({ status: 'quoted' })
        .eq('id', quoteRequest.id);

      toast({
        title: "Email Sent Successfully!",
        description: `Estimate sent to ${quoteRequest.email}`,
      });

      onEmailSent?.();
      onClose();

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please check logs for details.",
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
                            {template.template_name}
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
                    <span className={!quoteRequest?.email ? 'text-destructive font-medium' : ''}>
                      {quoteRequest?.email || '⚠️ No email available'}
                    </span>
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
              disabled={sending || !customSubject || !customMessage || !quoteRequest?.email || !invoice?.total_amount}
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