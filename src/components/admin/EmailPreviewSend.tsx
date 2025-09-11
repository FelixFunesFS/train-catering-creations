import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Eye, ArrowLeft, FileText, Edit3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailPreviewSendProps {
  quoteRequest: any;
  lineItems: any[];
  totals: any;
  onBack: () => void;
  onEmailSent: () => void;
}

export function EmailPreviewSend({ 
  quoteRequest, 
  lineItems, 
  totals,
  onBack, 
  onEmailSent 
}: EmailPreviewSendProps) {
  const [emailTemplate, setEmailTemplate] = useState('standard');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [attachPDF, setAttachPDF] = useState(true);
  const [isPreview, setIsPreview] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate default subject and message
    setCustomSubject(`Catering Estimate for ${quoteRequest.event_name}`);
    setCustomMessage(`Hello ${quoteRequest.contact_name},

Thank you for considering Soul Train's Eatery for your upcoming event. Please find your customized catering estimate attached.

We're excited about the opportunity to serve you and your guests with our authentic Southern cuisine that brings people together around exceptional food.

Event Details:
• ${quoteRequest.event_name}
• ${new Date(quoteRequest.event_date).toLocaleDateString()}
• ${quoteRequest.guest_count} guests
• ${quoteRequest.location}

Next Steps:
1. Review the attached estimate
2. Contact us with any questions or changes
3. Approve the estimate to secure your date
4. Complete payment to finalize your catering order

We look forward to making your event memorable with our delicious food and professional service.

Best regards,
Soul Train's Eatery Team
Phone: (843) 970-0265
Email: soultrainseatery@gmail.com`);
  }, [quoteRequest]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      // Create invoice/estimate in database first
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: quoteRequest.id,
          subtotal: totals.subtotal,
          tax_amount: totals.taxAmount,
          total_amount: totals.total,
          status: 'sent',
          document_type: 'estimate',
          is_draft: false,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items
      const lineItemsData = lineItems.map(item => ({
        invoice_id: invoice.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      // Update quote status
      const { error: quoteUpdateError } = await supabase
        .from('quote_requests')
        .update({ status: 'quoted' })
        .eq('id', quoteRequest.id);

      if (quoteUpdateError) throw quoteUpdateError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-estimate-email', {
        body: {
          invoiceId: invoice.id,
          customerEmail: quoteRequest.email,
          customSubject,
          customMessage,
          attachPDF
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Estimate Sent!",
        description: `Estimate has been sent to ${quoteRequest.email}`,
      });

      onEmailSent();

    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Error",
        description: "Failed to send estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'entree': 'bg-blue-100 text-blue-800',
      'appetizer': 'bg-green-100 text-green-800',
      'dessert': 'bg-purple-100 text-purple-800',
      'service': 'bg-orange-100 text-orange-800',
      'rental': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors['other'];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Preview & Send</h1>
          <p className="text-muted-foreground">Review and customize the estimate email before sending</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          <Button onClick={() => setIsPreview(!isPreview)} variant="outline">
            {isPreview ? (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Email
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Content */}
        <div className="lg:col-span-2 space-y-4">
          {!isPreview ? (
            /* Edit Mode */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Customize Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Professional</SelectItem>
                      <SelectItem value="formal">Formal Business</SelectItem>
                      <SelectItem value="friendly">Friendly & Personal</SelectItem>
                      <SelectItem value="government">Government Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Email Message</Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="attach-pdf"
                    checked={attachPDF}
                    onCheckedChange={setAttachPDF}
                  />
                  <Label htmlFor="attach-pdf">Attach PDF estimate</Label>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Headers */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">To:</span>
                    <span className="text-sm">{quoteRequest.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">From:</span>
                    <span className="text-sm">soultrainseatery@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                    <span className="text-sm font-medium">{customSubject}</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {customMessage}
                  </div>

                  <Separator className="my-6" />

                  {/* Estimate Summary in Email */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Estimate Summary</h3>
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Event:</span>
                          <p className="font-medium">{quoteRequest.event_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">{new Date(quoteRequest.event_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Guests:</span>
                          <p className="font-medium">{quoteRequest.guest_count}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{quoteRequest.location}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {lineItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.title}</span>
                                <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                                  {item.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(item.total_price / 100)}</span>
                          </div>
                        ))}
                        {lineItems.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            ...and {lineItems.length - 3} more items (see full estimate PDF)
                          </p>
                        )}
                      </div>

                      <Separator className="my-3" />

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Estimate:</span>
                        <span>{formatCurrency(totals.total / 100)}</span>
                      </div>
                    </div>

                    {attachPDF && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">Detailed_Estimate_{quoteRequest.event_name}.pdf</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{quoteRequest.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{quoteRequest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(totals.total / 100)}</span>
                </div>
              </div>

              <Separator />

              <Button 
                onClick={handleSendEmail} 
                disabled={sending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Estimate
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                The estimate will be saved and sent immediately. The customer will receive a link to view and approve online.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>• Customer receives email with estimate</p>
                <p>• They can approve, request changes, or ask questions</p>
                <p>• You'll be notified of their response</p>
                <p>• Once approved, you can convert to invoice</p>
                <p>• Customer can pay online to complete booking</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}