import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecordPayment } from '@/hooks/useInvoices';
import { useInvoiceSummary } from '@/hooks/useInvoiceSummary';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, Mail, CreditCard, Wallet, Copy, ExternalLink, CheckCircle2, AlertCircle, ArrowLeft, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmbeddedCheckout } from './EmbeddedCheckout';

interface PaymentRecorderProps {
  invoiceId: string;
  onClose: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function PaymentRecorder({ invoiceId, onClose }: PaymentRecorderProps) {
  const { data: invoiceSummary, isLoading: loadingInvoice } = useInvoiceSummary(invoiceId);
  const recordPayment = useRecordPayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Manual tab state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);

  // Stripe tab state
  const [stripePaymentType, setStripePaymentType] = useState<'full' | 'deposit' | 'milestone' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [embeddedClientSecret, setEmbeddedClientSecret] = useState('');
  const [showLinkFallback, setShowLinkFallback] = useState(false);

  const totalAmount = invoiceSummary?.total_amount || 0;
  const balanceRemaining = invoiceSummary?.balance_remaining || 0;
  const pendingMilestones = invoiceSummary?.milestones?.filter(m => m.status === 'pending') || [];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;
    
    await recordPayment.mutateAsync({
      invoiceId,
      amount: amountCents,
      paymentMethod,
      notes: notes || undefined,
      sendConfirmationEmail,
    });
    onClose();
  };

  const handlePayFullBalance = () => {
    setAmount((balanceRemaining / 100).toFixed(2));
  };

  const handleTakePayment = async (useLinkMode?: boolean) => {
    setStripeLoading(true);
    setEmbeddedClientSecret('');
    setCheckoutUrl('');
    
    const isLinkMode = useLinkMode ?? showLinkFallback;
    
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('customer_access_token')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice?.customer_access_token) {
        throw new Error('Could not retrieve invoice access token');
      }

      const body: Record<string, unknown> = {
        invoice_id: invoiceId,
        access_token: invoice.customer_access_token,
        payment_type: stripePaymentType === 'custom' ? 'milestone' : stripePaymentType,
        ui_mode: isLinkMode ? undefined : 'embedded',
      };

      if (stripePaymentType === 'custom') {
        const customCents = Math.round(parseFloat(customAmount) * 100);
        body.amount = customCents;
        body.payment_type = 'custom';
      } else if (stripePaymentType === 'milestone' && selectedMilestoneId) {
        body.milestone_id = selectedMilestoneId;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body,
      });

      if (error) throw error;

      if (isLinkMode) {
        if (!data?.url) throw new Error('No checkout URL returned');
        setCheckoutUrl(data.url);
        toast({
          title: 'Payment link generated',
          description: 'You can open the checkout or copy the link.',
        });
      } else {
        if (!data?.clientSecret) throw new Error('No client secret returned');
        setEmbeddedClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setStripeLoading(false);
    }
  };

  const handleEmbeddedComplete = () => {
    // Invalidate all payment-related caches so admin sees fresh data
    queryClient.removeQueries({ queryKey: ['invoice-summary', invoiceId] });
    queryClient.invalidateQueries({ queryKey: ['invoice-summary'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['ar-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    
    toast({
      title: 'Payment successful!',
      description: 'The transaction, milestones, and invoice status will update automatically.',
    });
    onClose();
  };

  const handleCopyLink = async () => {
    if (!checkoutUrl) return;
    await navigator.clipboard.writeText(checkoutUrl);
    setLinkCopied(true);
    toast({ title: 'Link copied to clipboard' });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleOpenCheckout = () => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank');
  };

  // Get the display amount for selected stripe payment type
  // Get next pending milestone for dynamic deposit option
  const nextPendingMilestone = pendingMilestones.length > 0 ? pendingMilestones[0] : null;
  const depositLabel = nextPendingMilestone 
    ? `${nextPendingMilestone.milestone_type} (${nextPendingMilestone.percentage}%)` 
    : '50% Deposit';
  const depositAmount = nextPendingMilestone 
    ? nextPendingMilestone.amount_cents 
    : Math.round(totalAmount * 0.5);

  const getStripeAmount = () => {
    if (stripePaymentType === 'full') return balanceRemaining;
    if (stripePaymentType === 'deposit') return depositAmount;
    if (stripePaymentType === 'custom') {
      const cents = Math.round(parseFloat(customAmount) * 100);
      return isNaN(cents) ? 0 : cents;
    }
    if (stripePaymentType === 'milestone' && selectedMilestoneId) {
      const milestone = pendingMilestones.find(m => m.id === selectedMilestoneId);
      return milestone?.amount_cents || 0;
    }
    return 0;
  };

  if (loadingInvoice) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Total</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          {invoiceSummary && invoiceSummary.total_paid > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Amount Paid</span>
              <span className="font-medium">{formatCurrency(invoiceSummary.total_paid)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="text-muted-foreground font-medium">Balance Due</span>
            <span className="font-semibold text-primary">{formatCurrency(balanceRemaining)}</span>
          </div>
        </div>

        <Tabs defaultValue="stripe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Wallet className="h-3.5 w-3.5" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CreditCard className="h-3.5 w-3.5" />
              Stripe (Card)
            </TabsTrigger>
          </TabsList>

          {/* ===== Manual Payment Tab ===== */}
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs"
                    onClick={handlePayFullBalance}
                  >
                    Pay Full Balance
                  </Button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer / ACH</SelectItem>
                    <SelectItem value="credit_card">Credit Card (Manual)</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Check #, reference number, etc."
                  rows={2}
                />
              </div>

              {/* Send Confirmation Email */}
              <div className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg">
                <Checkbox
                  id="sendEmail"
                  checked={sendConfirmationEmail}
                  onCheckedChange={(checked) => setSendConfirmationEmail(checked === true)}
                />
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sendEmail" className="cursor-pointer text-sm font-normal">
                    Send confirmation email to customer
                  </Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!amount || !paymentMethod || recordPayment.isPending}
                >
                  {recordPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Record Payment
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ===== Stripe (Card) Payment Tab ===== */}
          <TabsContent value="stripe">
            <div className="space-y-4">
              {embeddedClientSecret ? (
                /* ===== Embedded Checkout Form ===== */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEmbeddedClientSecret('')}
                      className="text-xs"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Back
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(getStripeAmount())}
                    </p>
                  </div>
                  <EmbeddedCheckout
                    clientSecret={embeddedClientSecret}
                    onComplete={handleEmbeddedComplete}
                  />
                </div>
              ) : checkoutUrl ? (
                /* ===== Checkout URL Generated (Link Fallback) ===== */
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="font-medium text-emerald-800">Payment Link Ready</p>
                    <p className="text-xs text-emerald-600">
                      {formatCurrency(getStripeAmount())} • {stripePaymentType === 'deposit' ? '50% Deposit' : stripePaymentType === 'milestone' ? 'Milestone Payment' : 'Full Balance'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={handleOpenCheckout} className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Checkout Page
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="w-full">
                      {linkCopied ? (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Copied!</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-2" /> Copy Link</>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Once payment completes on Stripe, the transaction, milestones, and invoice status will update automatically.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setCheckoutUrl(''); setShowLinkFallback(false); }} className="text-sm">
                      Back
                    </Button>
                    <Button variant="outline" onClick={onClose} className="text-sm">
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Type Selection */}
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select 
                      value={stripePaymentType} 
                      onValueChange={(v) => {
                        setStripePaymentType(v as 'full' | 'deposit' | 'milestone' | 'custom');
                        setSelectedMilestoneId('');
                        setCustomAmount('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Balance — {formatCurrency(balanceRemaining)}</SelectItem>
                        <SelectItem value="deposit">{depositLabel} — {formatCurrency(depositAmount)}</SelectItem>
                        {pendingMilestones.length > 0 && (
                          <SelectItem value="milestone">Pay Milestone</SelectItem>
                        )}
                        <SelectItem value="custom">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Milestone selector */}
                  {stripePaymentType === 'milestone' && pendingMilestones.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select Milestone</Label>
                      <Select value={selectedMilestoneId} onValueChange={setSelectedMilestoneId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingMilestones.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.milestone_type} — {formatCurrency(m.amount_cents)} ({m.percentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Custom amount input */}
                  {stripePaymentType === 'custom' && (
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                      {getStripeAmount() > balanceRemaining && balanceRemaining > 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Amount exceeds balance remaining ({formatCurrency(balanceRemaining)})
                        </p>
                      )}
                    </div>
                  )}

                  {/* Amount preview */}
                  {getStripeAmount() > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Checkout Amount</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(getStripeAmount())}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => handleTakePayment()}
                      disabled={stripeLoading || (stripePaymentType === 'milestone' && !selectedMilestoneId) || (stripePaymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0))}
                      className="w-full"
                    >
                      {stripeLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <CreditCard className="h-4 w-4 mr-2" />
                      Take Payment
                    </Button>
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => handleTakePayment(true)}
                        disabled={stripeLoading || (stripePaymentType === 'milestone' && !selectedMilestoneId) || (stripePaymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0))}
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        Share link instead
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
