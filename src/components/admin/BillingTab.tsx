import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Receipt, 
  DollarSign, 
  Mail, 
  Download,
  ExternalLink,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface BillingTabProps {
  quote: QuoteRequest;
  onGenerateInvoice: () => void;
  onResendInvoice: (invoiceId: string) => void;
}

// Mock data structure for demonstration
interface Invoice {
  id: string;
  invoiceNumber: string;
  workflow_status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountTotal: number;
  amountDue: number;
  currency: string;
  dueDate: string;
  invoiceUrl: string;
  hostedInvoiceUrl: string;
  pdfUrl: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  stripeCustomerId: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface PaymentHistory {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export function BillingTab({ quote, onGenerateInvoice, onResendInvoice }: BillingTabProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Mock data - in real implementation, this would come from props or API calls
  const customer: Customer | null = {
    id: '1',
    stripeCustomerId: 'cus_example123',
    email: quote.email,
    name: quote.contact_name,
    phone: quote.phone,
    address: {
      street: '123 Charleston St',
      city: 'Charleston',
      state: 'SC',
      zip: '29401'
    }
  };

  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      status: 'open',
      amountTotal: 249900, // $2,499.00 in cents
      amountDue: 249900,
      currency: 'usd',
      dueDate: '2024-02-15',
      invoiceUrl: 'https://invoice.stripe.com/example',
      hostedInvoiceUrl: 'https://invoice.stripe.com/hosted/example',
      pdfUrl: 'https://invoice.stripe.com/pdf/example',
      paymentUrl: 'https://invoice.stripe.com/pay/example',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      invoiceId: '1',
      amount: 124950, // $1,249.50 partial payment
      currency: 'usd',
      status: 'succeeded',
      paymentMethod: 'card',
      createdAt: '2024-01-16T14:30:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'open': return 'bg-warning text-warning-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'void': case 'uncollectible': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'open': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      case 'void': case 'uncollectible': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleAction = async (action: string, callback: () => void) => {
    setLoadingActions(prev => ({ ...prev, [action]: true }));
    try {
      await callback();
    } finally {
      setLoadingActions(prev => ({ ...prev, [action]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{customer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stripe Customer ID</p>
                  <p className="text-sm font-mono">{customer.stripeCustomerId}</p>
                </div>
              </div>
              {customer.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Billing Address</p>
                  <p className="text-sm">
                    {customer.address.street}<br />
                    {customer.address.city}, {customer.address.state} {customer.address.zip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No customer record found</p>
              <Button variant="outline">
                Create Stripe Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoices
            </CardTitle>
            <Button onClick={onGenerateInvoice} disabled={!customer}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No invoices generated yet</p>
              <Button onClick={onGenerateInvoice} disabled={!customer}>
                Generate First Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1 capitalize">{invoice.status}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Amount</p>
                            <p className="font-medium">{formatCurrency(invoice.amountTotal, invoice.currency)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className="font-medium text-warning">{formatCurrency(invoice.amountDue, invoice.currency)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Invoice
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(invoice.pdfUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        {invoice.paymentUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(invoice.paymentUrl, '_blank')}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Payment Link
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(`resend-${invoice.id}`, () => onResendInvoice(invoice.id))}
                          disabled={loadingActions[`resend-${invoice.id}`]}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="text-center py-6">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      payment.status === 'succeeded' ? 'bg-success/20 text-success' :
                      payment.status === 'pending' ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {payment.status === 'succeeded' ? <CheckCircle className="h-4 w-4" /> :
                       payment.status === 'pending' ? <Clock className="h-4 w-4" /> :
                       <XCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment.paymentMethod} • {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.open('/admin/customer-portal', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Customer Portal
            </Button>
            <Button variant="outline" onClick={() => window.open('/admin/payment-links', '_blank')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
            <Button variant="outline" onClick={() => window.open('/admin/stripe-dashboard', '_blank')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open('/admin/reports', '_blank')}>
              <Receipt className="h-4 w-4 mr-2" />
              Financial Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}