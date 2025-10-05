import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
      const { data: items } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('category', { ascending: true });
      
      setLineItems(items || []);
      const preview = generateEmailPreview(items || []);
      setEmailPreview(preview);
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

  const generateEmailPreview = (items: any[]) => {
    const formatCurrency = (cents: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .btn { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
          thead tr { background: #f8f9fa; border-bottom: 2px solid #dee2e6; }
          th { text-align: left; padding: 12px; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e9ecef; }
          tfoot tr { border-top: 2px solid #dee2e6; }
          .total-row { background: #f8f9fa; font-weight: 700; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0">Soul Train's Eatery</h1>
            <p style="margin:5px 0">Authentic Southern Catering</p>
          </div>
          <div class="content">
            <h2>Your Estimate for ${quote.event_name}</h2>
            <p>${customMessage || `Thank you for considering Soul Train's Eatery for your upcoming ${quote.event_name}!`}</p>
            
            <p><strong>Event Details:</strong></p>
            <ul>
              <li>Date: ${new Date(quote.event_date).toLocaleDateString()}</li>
              <li>Guests: ${quote.guest_count}</li>
              <li>Location: ${quote.location}</li>
            </ul>
            
            <h3 style="color: #DC143C; margin-top: 30px;">Estimate Breakdown</h3>
            
            ${items.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 100px;">Unit Price</th>
                  <th style="text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>
                      <div style="font-weight: 500;">${item.title || 'Item'}</div>
                      ${item.description ? `<div style="font-size: 12px; color: #666;">${item.description}</div>` : ''}
                      ${item.category ? `<div style="font-size: 11px; color: #999; text-transform: uppercase;">${item.category}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
                    <td style="text-align: right; font-weight: 500;">${formatCurrency(item.total_price)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: 500;">Subtotal:</td>
                  <td style="text-align: right; font-weight: 500;">${formatCurrency(invoice.subtotal)}</td>
                </tr>
                ${invoice.tax_amount > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right;">Tax (9.5%):</td>
                  <td style="text-align: right;">${formatCurrency(invoice.tax_amount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total Estimate:</td>
                  <td style="text-align: right; color: #DC143C;">${formatCurrency(invoice.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
            ` : `<p><strong>Total Estimate: ${formatCurrency(invoice.total_amount)}</strong></p>`}
            
            <a href="#" class="btn">View & Approve Estimate</a>
          </div>
          <div class="footer">
            <p>Soul Train's Eatery | (843) 970-0265 | soultrainseatery@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
        .update({ status: 'sent' })
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview & Customization</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div>
              <Label htmlFor="recipient">To:</Label>
              <Input 
                id="recipient" 
                value={`${quote.contact_name} <${quote.email}>`} 
                disabled 
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
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personalized message..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will appear at the top of the email
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Line Items Summary:</h4>
              <p className="text-sm text-muted-foreground">
                {lineItems.length} items totaling {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount / 100)}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {previewLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div 
                className="border rounded-lg overflow-auto h-96"
                dangerouslySetInnerHTML={{ __html: emailPreview }}
              />
            )}
          </TabsContent>
        </Tabs>

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
