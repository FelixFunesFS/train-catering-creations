import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvoicePaymentSummary } from '@/services/PaymentDataService';
import { Eye, Send, Loader2, X } from 'lucide-react';

interface LineItem {
  id: string;
  title: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string | null;
}

interface EmailPreviewProps {
  invoice: InvoicePaymentSummary;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  isGovernment: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  isSending: boolean;
}

export function EmailPreview({
  invoice,
  lineItems,
  subtotal,
  taxAmount,
  total,
  isGovernment,
  onClose,
  onConfirmSend,
  isSending,
}: EmailPreviewProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatServiceType = (type: string | null) => {
    if (!type) return 'Standard Service';
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group items by category
  const groupedItems = lineItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, LineItem[]>);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </DialogTitle>
        </DialogHeader>

        {/* Email Preview Container */}
        <div className="mx-6 mb-4 border rounded-lg overflow-hidden bg-background">
          {/* Header */}
          <div 
            className="p-6 text-center"
            style={{ background: 'linear-gradient(135deg, hsl(348, 83%, 47%) 0%, hsl(348, 70%, 55%) 100%)' }}
          >
            <h1 className="text-2xl font-bold text-white">Soul Train's Eatery</h1>
            <p className="text-white/90 text-sm">Authentic Southern Catering • Charleston's Lowcountry</p>
          </div>

          {/* Status Badge */}
          <div className="p-4 bg-muted/30 text-center">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: 'hsl(45, 93%, 47%)', color: 'hsl(348, 83%, 30%)' }}
            >
              💰 ESTIMATE READY
            </span>
            <p className="text-muted-foreground text-sm mt-2">
              Your catering estimate for {invoice.event_name} is ready for review.
            </p>
          </div>

          {/* Event Details Card */}
          <div className="p-6">
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3 text-sm">Event Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Event:</span>
                  <span className="ml-2 font-medium">{invoice.event_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2 font-medium">{formatDate(invoice.event_date)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Guests:</span>
                  <span className="ml-2 font-medium">{invoice.guest_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Service:</span>
                  <span className="ml-2 font-medium">{formatServiceType(invoice.service_type)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 font-medium">{invoice.location || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items by Category */}
          <div className="px-6 pb-4">
            <h3 className="font-semibold mb-3 text-sm">Your Custom Menu</h3>
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {category}
                </p>
                <div className="space-y-1">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.title || item.description}</span>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {isGovernment ? (
                  <div className="flex justify-between text-blue-600">
                    <span>Tax (Exempt)</span>
                    <span>$0.00</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="pl-2">• SC Hospitality Tax (2%)</span>
                      <span>{formatCurrency(Math.round(subtotal * 0.02))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="pl-2">• SC Service Tax (7%)</span>
                      <span>{formatCurrency(Math.round(subtotal * 0.07))}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span style={{ color: 'hsl(348, 83%, 47%)' }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button Preview */}
          <div className="px-6 pb-6 text-center">
            <div 
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white cursor-default"
              style={{ backgroundColor: 'hsl(348, 83%, 47%)' }}
            >
              View Full Estimate & Approve
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              (Button will link to customer portal)
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/50 text-center border-t">
            <p className="text-sm font-medium">Soul Train's Eatery</p>
            <p className="text-xs text-muted-foreground">
              📞 (843) 970-0265 • ✉️ soultrainseatery@gmail.com
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Proudly serving Charleston's Lowcountry
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            This email will be sent to: <strong>{invoice.email}</strong>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onConfirmSend} disabled={isSending}>
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Confirm & Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
