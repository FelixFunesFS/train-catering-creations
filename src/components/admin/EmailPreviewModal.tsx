import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { renderEmailHTML, generateSubject } from '@/services/EmailTemplateRenderer';
import { extractVariables } from '@/utils/emailVariables';
import { EditableEventDetailsInline } from './EditableEventDetailsInline';
import { TemplateVariableHelper } from './TemplateVariableHelper';

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  quote: any;
  invoice: any;
  emailType: 'estimate' | 'contract' | 'payment_request' | 'event_confirmation' | 'thank_you_feedback';
  onSent?: () => void;
}

export function EmailPreviewModal({ 
  open, 
  onClose, 
  quote, 
  invoice, 
  emailType,
  onSent 
}: EmailPreviewModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [currentQuote, setCurrentQuote] = useState(quote);
  const [activeTab, setActiveTab] = useState('preview');
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const defaultSubjects = {
    estimate: `Your Estimate - Soul Train's Eatery`,
    contract: 'Your Contract is Ready for Signature',
    payment_request: `Payment Request - Soul Train's Eatery`,
    event_confirmation: `Event Confirmed: ${quote?.event_name || 'Your Event'}`,
    thank_you_feedback: `Thank You for Choosing Soul Train's Eatery!`
  };

  useEffect(() => {
    if (open && currentQuote && invoice) {
      const subject = generateSubject(emailType, { quote: currentQuote, invoice });
      setCustomSubject(subject);
      refreshPreview();
    }
  }, [open, currentQuote, invoice, emailType]);

  const refreshPreview = () => {
    const html = renderEmailHTML({
      emailType,
      data: { quote: currentQuote, invoice },
      customMessage,
      customSubject
    });
    setEmailPreview(html);
  };

  // Refresh preview when custom message changes
  useEffect(() => {
    if (open && currentQuote && invoice) {
      refreshPreview();
    }
  }, [customMessage, currentQuote]);

  const handleQuoteUpdate = (updates: Partial<any>) => {
    setCurrentQuote(prev => ({ ...prev, ...updates }));
  };

  const handleInsertVariable = (variableTag: string) => {
    if (messageRef.current) {
      const start = messageRef.current.selectionStart;
      const end = messageRef.current.selectionEnd;
      const text = customMessage;
      const newText = text.substring(0, start) + variableTag + text.substring(end);
      setCustomMessage(newText);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.focus();
          messageRef.current.selectionStart = messageRef.current.selectionEnd = start + variableTag.length;
        }
      }, 0);
    }
  };


  const handleSend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-workflow-email', {
        body: {
          quoteId: quote.id,
          invoiceId: invoice.id,
          emailType,
          customSubject: customSubject !== defaultSubjects[emailType] ? customSubject : undefined,
          customMessage: customMessage || undefined
        }
      });

      if (error) throw error;

      await supabase
        .from('invoices')
        .update({ workflow_status: 'sent' })
        .eq('id', invoice.id);

      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${quote.email}`,
      });

      onSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Unified Email Preview & Customer Details
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Email Preview</TabsTrigger>
            <TabsTrigger value="customize">Customize Message</TabsTrigger>
            <TabsTrigger value="customer">Customer Details</TabsTrigger>
          </TabsList>

          {/* Tab: Email Preview */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Live Email Preview</h3>
                <Badge variant="outline" className="text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                  Real-time Updates
                </Badge>
              </div>
              <div className="border rounded-lg flex-1 overflow-auto bg-white shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                ℹ️ This is exactly how your customer will see the email
              </p>
            </div>
          </TabsContent>

          {/* Tab: Customize Message */}
          <TabsContent value="customize" className="flex-1 overflow-auto mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Email Editor */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Email Content</h3>
                
                <div>
                  <Label htmlFor="recipient">To:</Label>
                  <Input 
                    id="recipient" 
                    value={`${currentQuote.contact_name} <${currentQuote.email}>`} 
                    disabled 
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject:</Label>
                  <Input 
                    id="subject" 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Custom Message (Optional):</Label>
                  <Textarea 
                    ref={messageRef}
                    id="message" 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personalized message... Use variables like {customer_name}, {event_date}, {invoice_total}"
                    rows={8}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will appear at the top of the email. Click variables below to insert.
                  </p>
                </div>

                <div className="border rounded-lg p-3 bg-accent/20">
                  <h4 className="font-semibold mb-2 text-sm">💡 Real-time Preview</h4>
                  <p className="text-xs text-muted-foreground">
                    Changes update instantly in the preview tab. Variables are replaced with actual values.
                  </p>
                </div>
              </div>

              {/* Right: Variable Helper */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Available Variables</h3>
                <TemplateVariableHelper 
                  data={{ quote: currentQuote, invoice }}
                  onInsertVariable={handleInsertVariable}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Customer Details */}
          <TabsContent value="customer" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Edit Customer & Event Details</h3>
                <Badge variant="secondary" className="text-xs">
                  Changes update preview instantly
                </Badge>
              </div>
              
              <div className="border rounded-lg p-6 bg-card">
                <EditableEventDetailsInline 
                  quote={currentQuote}
                  onUpdate={handleQuoteUpdate}
                />
              </div>

              <div className="border rounded-lg p-4 bg-primary/5">
                <h4 className="font-semibold mb-2 text-sm">📧 Preview Updates</h4>
                <p className="text-xs text-muted-foreground">
                  After saving changes, switch to the "Email Preview" tab to see how the updated information appears in the email.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount / 100)}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email to Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
