import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { InvoiceDraftManager } from './InvoiceDraftManager';
import { InvoiceQuoteSyncManager } from './InvoiceQuoteSyncManager';
import {
  DollarSign,
  FileText,
  Send,
  Eye,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ExternalLink,
  User,
  Mail,
  Phone,
  Edit3
} from 'lucide-react';

interface BillingTabProps {
  quote: any;
  onGenerateInvoice?: () => void;
  onResendInvoice?: () => void;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string;
  sent_at?: string;
  viewed_at?: string;
  paid_at?: string;
  pdf_url?: string;
  stripe_invoice_id?: string;
}

interface Customer {
  id: string;
  stripe_customer_id?: string;
  name: string;
  email: string;
  phone?: string;
}

export function EnhancedBillingTab({ quote, onGenerateInvoice, onResendInvoice }: BillingTabProps) {
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'preview' | 'edit' | 'template'>('preview');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, [quote.id]);

  const fetchBillingData = async () => {
    setRefreshing(true);
    try {
      // Fetch customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('quote_request_id', quote.id)
        .maybeSingle();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      setCustomer(customerData);

      // Fetch invoices if customer exists
      if (customerData) {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });

        if (invoicesError) {
          throw invoicesError;
        }

        setInvoices(invoicesData || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billing information",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAction = async (actionKey: string, action: () => Promise<void>) => {
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionKey}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionKey.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const createStripeCustomer = async () => {
    await handleAction('createCustomer', async () => {
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: { quote_request_id: quote.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer created successfully in Stripe",
      });

      await fetchBillingData();
    });
  };

  const generateInvoice = async (overrides?: any) => {
    await handleAction('generateInvoice', async () => {
      const body: any = { quote_request_id: quote.id };
      if (overrides) {
        body.manual_overrides = overrides;
      }

      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });

      await fetchBillingData();
      onGenerateInvoice?.();
    });
  };

  const handleGenerateDraft = async () => {
    await handleAction('generateDraft', async () => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quote.id }
      });

      if (error) throw error;

      // Set the generated invoice data to the modal
      setPreviewInvoiceData({
        ...data,
        is_draft: true,
        line_items: data.line_items || []
      });
      setModalMode('edit');
      setShowPreviewModal(true);

      toast({
        title: "Draft Generated",
        description: "Invoice draft created with all menu selections. Set pricing to continue.",
      });
    });
  };

  const handlePreviewInvoice = (invoiceData?: any) => {
    if (invoiceData) {
      setPreviewInvoiceData(invoiceData);
      setModalMode('preview');
    } else {
      // Generate a quick preview from existing quote data
      setPreviewInvoiceData({
        subtotal: quote.estimated_total || 0,
        tax_amount: Math.round((quote.estimated_total || 0) * 0.08),
        total_amount: Math.round((quote.estimated_total || 0) * 1.08),
        line_items: [],
        is_draft: false
      });
      setModalMode('preview');
    }
    setShowPreviewModal(true);
  };

  const handleEditDraft = (draft: any) => {
    setPreviewInvoiceData(draft);
    setModalMode('edit');
    setShowPreviewModal(true);
  };

  const handleDeleteDraft = (draftId: string) => {
    // Refresh invoice list after deletion
    fetchBillingData();
  };

  const handleGenerateFromDraft = async (draftId: string) => {
    await handleAction('generateFromDraft', async () => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-draft', {
        body: { draft_id: draftId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice generated from draft successfully"
      });

      await fetchBillingData();
    });
  };

  const sendInvoice = async (invoiceId: string) => {
    await handleAction(`sendInvoice-${invoiceId}`, async () => {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });

      await fetchBillingData();
      onResendInvoice?.();
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'viewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Quote-Invoice Sync Status */}
      <InvoiceQuoteSyncManager 
        quoteId={quote.id} 
        onSyncComplete={fetchBillingData}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drafts">Draft Manager</TabsTrigger>
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Customer Information */}
          <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchBillingData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {customer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Stripe Customer: {customer.stripe_customer_id ? 'Yes' : 'No'}
                  </span>
                </div>
                {customer.stripe_customer_id && (
                  <Badge variant="outline" className="text-xs">
                    ID: {customer.stripe_customer_id}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                No customer record found. Create a Stripe customer to generate invoices.
              </p>
              <Button
                onClick={createStripeCustomer}
                disabled={loadingActions.createCustomer}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {loadingActions.createCustomer ? 'Creating...' : 'Create Stripe Customer'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Management */}
      {customer && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Management
            </CardTitle>
            <div className="bg-muted/30 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 text-primary">3-Step Invoice Process</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-background">1. Generate Draft</Badge>
                <span>→</span>
                <Badge variant="outline" className="bg-background">2. Set Pricing</Badge>
                <span>→</span>
                <Badge variant="outline" className="bg-background">3. Review & Send</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateDraft}
                disabled={loadingActions.generateDraft}
                className="flex items-center gap-2"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                {loadingActions.generateDraft ? 'Generating...' : '1. Generate Draft Invoice'}
              </Button>
              {invoices.length > 0 && (
                <Button
                  onClick={() => handlePreviewInvoice()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Preview Latest
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <h4 className="font-medium">{invoice.invoice_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <label className="text-muted-foreground">Due Date</label>
                        <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      {invoice.sent_at && (
                        <div>
                          <label className="text-muted-foreground">Sent</label>
                          <p>{new Date(invoice.sent_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {invoice.viewed_at && (
                        <div>
                          <label className="text-muted-foreground">Viewed</label>
                          <p>{new Date(invoice.viewed_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {invoice.paid_at && (
                        <div>
                          <label className="text-muted-foreground">Paid</label>
                          <p>{new Date(invoice.paid_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {invoice.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => sendInvoice(invoice.id)}
                          disabled={loadingActions[`sendInvoice-${invoice.id}`]}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-3 w-3" />
                          {loadingActions[`sendInvoice-${invoice.id}`] ? 'Sending...' : 'Send Invoice'}
                        </Button>
                      )}
                      {invoice.pdf_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.pdf_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download PDF
                        </Button>
                      )}
                      {invoice.stripe_invoice_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/invoices/${invoice.stripe_invoice_id}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View in Stripe
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No invoices generated yet. Create your first invoice to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.open('https://dashboard.stripe.com/customers', '_blank')}
            >
              <User className="h-5 w-5" />
              <span className="text-sm">Customer Portal</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.open('https://dashboard.stripe.com/invoices', '_blank')}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">All Invoices</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.open('https://dashboard.stripe.com/payments', '_blank')}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Payments</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            >
              <ExternalLink className="h-5 w-5" />
              <span className="text-sm">Stripe Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <InvoiceDraftManager 
            onEditDraft={handleEditDraft}
            onDeleteDraft={handleDeleteDraft}
            onGenerateFromDraft={handleGenerateFromDraft}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          {/* Invoice History - existing invoice management content */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(invoice.status)}
                            <div>
                              <h4 className="font-medium">{invoice.invoice_number}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(invoice.total_amount)}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <label className="text-muted-foreground">Due Date</label>
                            <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                          </div>
                          {invoice.sent_at && (
                            <div>
                              <label className="text-muted-foreground">Sent</label>
                              <p>{new Date(invoice.sent_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => sendInvoice(invoice.id)}
                              disabled={loadingActions[`sendInvoice-${invoice.id}`]}
                              className="flex items-center gap-2"
                            >
                              <Send className="h-3 w-3" />
                              {loadingActions[`sendInvoice-${invoice.id}`] ? 'Sending...' : 'Send Invoice'}
                            </Button>
                          )}
                          {invoice.stripe_invoice_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://dashboard.stripe.com/invoices/${invoice.stripe_invoice_id}`, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View in Stripe
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No invoices generated yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <InvoicePreviewModal
        quote={quote}
        invoiceData={previewInvoiceData}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onGenerate={generateInvoice}
        onSend={sendInvoice}
        mode={modalMode}
      />
    </div>
  );
}