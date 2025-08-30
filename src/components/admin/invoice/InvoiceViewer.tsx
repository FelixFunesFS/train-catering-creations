import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send, ExternalLink, User, Calendar, MapPin } from 'lucide-react';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  id?: string;
  invoice_number?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  status?: string;
  due_date?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface QuoteData {
  contact_name: string;
  email: string;
  phone?: string;
  event_name: string;
  event_date: string;
  location: string;
  guest_count: number;
}

interface InvoiceViewerProps {
  invoice: InvoiceData;
  customer?: Customer;
  quote?: QuoteData;
  onSend?: (invoiceId: string) => void;
  onDownload?: (invoiceId: string) => void;
  onViewInStripe?: (stripeInvoiceId: string) => void;
  showActions?: boolean;
  className?: string;
  documentType?: 'estimate' | 'invoice';
}

export function InvoiceViewer({
  invoice,
  customer,
  quote,
  onSend,
  onDownload,
  onViewInStripe,
  showActions = false,
  className = "",
  documentType = 'invoice'
}: InvoiceViewerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'sent':
        return 'bg-info/10 text-info border-info/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <Card className={`max-w-4xl mx-auto print:shadow-none print:border-none ${className}`}>
      {/* Invoice Header */}
      <CardHeader className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">Soul Train's Eatery</h1>
            <p className="text-muted-foreground">Charleston's Trusted Catering Partner</p>
            <p className="text-sm text-muted-foreground mt-2">
              Phone: (843) 970-0265 • Email: soultrainseatery@gmail.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold">{documentType.toUpperCase()}</h2>
            {invoice.invoice_number && (
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
            )}
            {invoice.status && (
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Bill To:
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{customer?.name || quote?.contact_name}</p>
              <p>{customer?.email || quote?.email}</p>
              {(customer?.phone || quote?.phone) && (
                <p>{customer?.phone || quote?.phone}</p>
              )}
              {customer?.address && <p>{customer.address}</p>}
            </div>
          </div>

          {/* Event Details */}
          {quote && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Details:
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{quote.event_name}</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(quote.event_date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {quote.location}
                </p>
                <p>Guests: {quote.guest_count}</p>
              </div>
            </div>
          )}
        </div>

        {invoice.due_date && (
          <div className="flex justify-between text-sm">
            <span>Invoice Date: {new Date().toLocaleDateString()}</span>
            <span>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Line Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Services & Items</h3>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {invoice.line_items.map((item, index) => (
              <div key={item.id || index} className="px-4 py-3 border-t grid grid-cols-12 gap-4 text-sm">
                <div className="col-span-6">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
                <div className="col-span-2 text-right font-medium">{formatCurrency(item.total_price)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-muted/30 p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Payment Terms</h4>
          <p className="text-muted-foreground">
            Payment is due within 30 days of invoice date. Please contact us at (843) 970-0265 
            with any questions regarding this invoice.
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-3 pt-4 print:hidden">
            {invoice.status === 'draft' && onSend && invoice.id && (
              <Button onClick={() => onSend(invoice.id!)} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send {documentType === 'estimate' ? 'Estimate' : 'Invoice'}
              </Button>
            )}
            {invoice.pdf_url && onDownload && invoice.id && (
              <Button variant="outline" onClick={() => onDownload(invoice.id!)}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
            {invoice.stripe_invoice_id && onViewInStripe && (
              <Button variant="outline" onClick={() => onViewInStripe(invoice.stripe_invoice_id!)}>
                <ExternalLink className="h-4 w-4" />
                View in Stripe
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}