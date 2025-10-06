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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #333; background: #fafafa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); padding: 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          .header .tagline { margin: 10px 0 0; font-size: 16px; color: #FFD700; font-style: italic; }
          .header .subtitle { margin: 5px 0 0; font-size: 14px; color: rgba(255,255,255,0.9); }
          .content { padding: 40px 30px; }
          .greeting { color: #DC143C; font-size: 24px; margin-bottom: 10px; }
          .event-details { background: linear-gradient(to right, #FFF5E6, #FFE4E1); padding: 25px; border-radius: 8px; border-left: 4px solid #DC143C; margin: 25px 0; }
          .event-details h3 { color: #DC143C; margin: 0 0 15px 0; font-size: 18px; }
          .event-details table { width: 100%; font-size: 14px; }
          .event-details td { padding: 8px 0; }
          .menu-title { color: #DC143C; margin: 35px 0 20px; font-size: 22px; border-bottom: 3px solid #FFD700; padding-bottom: 10px; }
          .menu-subtitle { font-size: 14px; color: #666; font-style: italic; margin-bottom: 20px; }
          table.items { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table.items thead tr { background: linear-gradient(135deg, #DC143C, #B91C3C); color: white; }
          table.items th { text-align: left; padding: 15px; font-weight: 600; }
          table.items tbody tr:nth-child(even) { background: #FFF5E6; }
          table.items tbody tr:nth-child(odd) { background: #fff; }
          table.items tbody tr { border-bottom: 1px solid #e9ecef; }
          table.items td { padding: 15px; }
          table.items .item-title { font-weight: 600; color: #333; margin-bottom: 4px; }
          table.items .item-desc { font-size: 12px; color: #666; line-height: 1.4; }
          table.items tfoot tr { background: #FFF5E6; }
          table.items .total-row { background: linear-gradient(135deg, #DC143C, #B91C3C) !important; color: white; }
          .btn { display: inline-block; background: linear-gradient(135deg, #DC143C, #B91C3C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3); margin: 30px 0; }
          .btn-note { margin-top: 15px; font-size: 13px; color: #666; }
          .footer { background: linear-gradient(to right, #f8f9fa, #e9ecef); padding: 30px; text-align: center; border-top: 3px solid #FFD700; }
          .footer .title { margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #333; }
          .footer .contact { margin: 5px 0; color: #666; }
          .footer .contact a { color: #DC143C; text-decoration: none; }
          .footer .tagline-footer { margin: 15px 0 5px; font-size: 12px; color: #999; }
          .footer .love { margin: 5px 0; font-size: 12px; color: #999; font-style: italic; }
          @media only screen and (max-width: 600px) {
            .container { border-radius: 0 !important; }
            .header { padding: 25px 15px !important; }
            .header h1 { font-size: 24px !important; }
            .content { padding: 20px 15px !important; }
            table.items { font-size: 12px !important; }
            table.items th, table.items td { padding: 10px 8px !important; }
            .btn { padding: 14px 30px !important; font-size: 16px !important; display: block !important; margin: 20px auto !important; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Soul Train's Eatery</h1>
            <p class="tagline">Where Southern Soul Meets Lowcountry Love</p>
            <p class="subtitle">Charleston's Premier Family-Run Catering</p>
          </div>
          <div class="content">
            <h2 class="greeting">Hello ${quote.contact_name}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.8; color: #333;">
              ${customMessage || `We're so excited to be part of your special day! Here's your personalized estimate for ${quote.event_name}. We've hand-picked the perfect menu to make your celebration unforgettable.`}
            </p>
            
            <div class="event-details">
              <h3>📅 Your Event Details</h3>
              <table>
                <tr>
                  <td style="color: #666;"><strong>🗓️ Date:</strong></td>
                  <td style="color: #333;">${new Date(quote.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="color: #666;"><strong>👥 Guests:</strong></td>
                  <td style="color: #333;">${quote.guest_count} hungry souls</td>
                </tr>
                <tr>
                  <td style="color: #666;"><strong>📍 Location:</strong></td>
                  <td style="color: #333;">${quote.location}</td>
                </tr>
              </table>
            </div>
            
            <h3 class="menu-title">🍴 Your Soul Food Menu</h3>
            <p class="menu-subtitle">Prepared fresh with love, just like Grandma used to make</p>
            
            ${items.length > 0 ? `
            <table class="items">
              <thead>
                <tr>
                  <th>Menu Item</th>
                  <th style="text-align: center;">Servings</th>
                  <th style="text-align: right;">Price per</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td>
                      <div class="item-title">${item.title || 'Item'}</div>
                      ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center; color: #666; font-weight: 500;">${item.quantity}</td>
                    <td style="text-align: right; color: #666;">${formatCurrency(item.unit_price)}</td>
                    <td style="text-align: right; font-weight: 600; color: #DC143C;">${formatCurrency(item.total_price)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 15px; font-weight: 600; color: #666;">Subtotal:</td>
                  <td style="text-align: right; padding: 15px; font-weight: 600;">${formatCurrency(invoice.subtotal)}</td>
                </tr>
                ${invoice.tax_amount > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right; padding: 15px; color: #666;">Tax (9.5%):</td>
                  <td style="text-align: right; padding: 15px;">${formatCurrency(invoice.tax_amount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 18px; font-weight: 700; font-size: 18px;">Your Total Investment:</td>
                  <td style="text-align: right; padding: 18px; font-weight: 700; font-size: 20px;">${formatCurrency(invoice.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
            ` : `<p><strong>Total Estimate: ${formatCurrency(invoice.total_amount)}</strong></p>`}
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="#" class="btn">👉 View & Approve Your Estimate</a>
              <p class="btn-note">Questions? We're here to help make your event perfect!</p>
            </div>
          </div>
          <div class="footer">
            <p class="title">📞 Contact Soul Train's Eatery</p>
            <p class="contact"><strong>Phone:</strong> <a href="tel:8439700265">(843) 970-0265</a></p>
            <p class="contact"><strong>Email:</strong> <a href="mailto:soultrainseatery@gmail.com">soultrainseatery@gmail.com</a></p>
            <p class="tagline-footer">Proudly serving Charleston's Lowcountry and surrounding areas</p>
            <p class="love">❤️ Made with Southern Love by the Soul Train Family</p>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview & Customization</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Email Editor */}
          <div className="space-y-4 border-r pr-6">
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
                onChange={(e) => {
                  setCustomSubject(e.target.value);
                  setEmailPreview(generateEmailPreview(lineItems));
                }}
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
                  setEmailPreview(generateEmailPreview(lineItems));
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
              <h4 className="font-semibold mb-2">Line Items Summary:</h4>
              <p className="text-sm text-muted-foreground">
                {lineItems.length} items totaling {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount / 100)}
              </p>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Email Preview</h3>
            {previewLoading ? (
              <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-lg h-[600px] overflow-auto bg-white shadow-inner">
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
