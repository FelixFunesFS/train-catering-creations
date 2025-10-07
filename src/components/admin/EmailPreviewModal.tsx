import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

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
  const [previewLoading, setPreviewLoading] = useState(true);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [lineItems, setLineItems] = useState<any[]>([]);

  const defaultSubjects = {
    estimate: `Your Estimate - Soul Train's Eatery`,
    contract: 'Your Contract is Ready for Signature',
    payment_request: `Payment Request - Soul Train's Eatery`,
    event_confirmation: `Event Confirmed: ${quote?.event_name || 'Your Event'}`,
    thank_you_feedback: `Thank You for Choosing Soul Train's Eatery!`
  };

  useEffect(() => {
    if (open && quote && invoice) {
      setCustomSubject(defaultSubjects[emailType]);
      loadPreview();
    }
  }, [open, quote, invoice, emailType]);

  const loadPreview = async () => {
    setPreviewLoading(true);
    try {
      // Call the edge function to get the REAL customer-facing email HTML
      const { data, error } = await supabase.functions.invoke('send-customer-portal-email', {
        body: {
          quote_request_id: quote.id,
          type: emailType === 'estimate' ? 'estimate_ready' : emailType,
          preview_only: true // Special flag to get HTML without sending
        }
      });

      if (error) throw error;
      
      // The edge function returns the actual HTML that will be sent
      setEmailPreview(data.html || '');
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: "Error",
        description: "Failed to load email preview",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle>Email Preview & Customization</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left Column: Email Editor */}
          <div className="space-y-4 border-r pr-6 overflow-y-auto max-h-[calc(95vh-180px)]">
            <h3 className="font-semibold text-lg">Customize Email</h3>
            
            <div>
              <Label htmlFor="recipient">To:</Label>
              <Input 
                id="recipient" 
                value={`${quote.contact_name} <${quote.email}>`} 
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
                id="message" 
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  loadPreview(); // Reload preview with new message
                }}
                placeholder="Add a personalized message..."
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will appear at the top of the email
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold mb-2 text-sm">💡 Preview Updates:</h4>
              <p className="text-xs text-muted-foreground">
                Changes appear instantly in the preview panel →
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Email Summary:</h4>
              <p className="text-sm text-muted-foreground">
                Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount / 100)}
              </p>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-4 overflow-hidden flex flex-col max-h-[calc(95vh-180px)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Email Preview</h3>
              <Badge variant="outline" className="text-xs">Live Preview</Badge>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center flex-1 border rounded-lg bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-lg flex-1 overflow-auto bg-white shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              ℹ️ This is how your customer will see the email
            </p>
          </div>
        </div>

        <DialogFooter>
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
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
