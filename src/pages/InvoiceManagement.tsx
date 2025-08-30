import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search, 
  RefreshCw,
  Edit3,
  Send,
  Eye,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  CreditCard,
  ArrowLeft,
  Mail
} from 'lucide-react';

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  quote_request_id: string;
  customer_name: string;
  customer_email: string;
  event_name: string;
  event_date: string;
  total_amount: number;
  status: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  due_date: string | null;
}

export default function InvoiceManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(name, email),
          quote_requests!inner(event_name, event_date, contact_name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedInvoices: InvoiceRecord[] = data.map((item: any) => ({
        id: item.id,
        invoice_number: item.invoice_number,
        quote_request_id: item.quote_request_id,
        customer_name: item.quote_requests.contact_name || item.customers.name,
        customer_email: item.customers.email,
        event_name: item.quote_requests.event_name,
        event_date: item.quote_requests.event_date,
        total_amount: item.total_amount,
        status: item.status,
        is_draft: item.is_draft,
        created_at: item.created_at,
        updated_at: item.updated_at,
        sent_at: item.sent_at,
        viewed_at: item.viewed_at,
        due_date: item.due_date
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'draft' && invoice.is_draft) ||
      (typeFilter === 'live' && !invoice.is_draft);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string, is_draft: boolean) => {
    if (is_draft) return <Edit3 className="h-4 w-4 text-yellow-500" />;
    
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, is_draft: boolean) => {
    if (is_draft) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'viewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleEditInvoice = (invoice: InvoiceRecord) => {
    navigate(`/admin/invoice-creation/${invoice.quote_request_id}?invoice_id=${invoice.id}`);
  };

  const handleViewSubmission = (invoice: InvoiceRecord) => {
    navigate(`/admin/dashboard`);
  };

  const handleViewInvoice = async (invoice: InvoiceRecord) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      // Open the PDF URL in a new tab
      if (data.pdf_url) {
        const newWindow = window.open(data.pdf_url, '_blank');
        if (newWindow) {
          // Trigger print dialog after content loads
          newWindow.onload = () => {
            setTimeout(() => {
              newWindow.print();
            }, 1000);
          };
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = async (invoice: InvoiceRecord) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: invoice.quote_request_id }
      });

      if (error) throw error;

      toast({
        title: "Invoice Generated",
        description: "Invoice has been generated and is ready for review",
      });

      // Navigate to the invoice creation page
      navigate(`/admin/invoice-creation/${invoice.quote_request_id}?invoice_id=${data.invoice_id}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async (invoice: InvoiceRecord) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      toast({
        title: "Estimate Sent",
        description: `Estimate sent to ${invoice.customer_email}`,
      });

      // Refresh the list
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send estimate",
        variant: "destructive"
      });
    }
  };

  const handleCreatePaymentLink = async (invoice: InvoiceRecord) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { 
          invoice_id: invoice.id,
          type: 'deposit' 
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Link Created",
        description: "Deposit payment link has been generated and sent to customer",
      });

      // Refresh the list
      fetchInvoices();
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive"
      });
    }
  };

  const handleSendManualEmail = async (invoice: InvoiceRecord, emailType: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-manual-email', {
        body: { 
          invoice_id: invoice.id,
          email_type: emailType
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleMarkDeposited = async (invoice: InvoiceRecord) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'deposit_paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id);

      if (error) throw error;

      toast({
        title: "Deposit Marked",
        description: "Invoice marked as deposit paid",
      });

      fetchInvoices();
    } catch (error) {
      console.error('Error marking deposit:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: invoices.length,
    drafts: invoices.filter(i => i.is_draft).length,
    sent: invoices.filter(i => i.status === 'sent').length,
    approved: invoices.filter(i => i.status === 'approved').length,
    totalValue: invoices.reduce((sum, i) => sum + i.total_amount, 0)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Invoice Management", current: true }
          ]} 
        />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">
            Manage all estimates and invoices from one central location
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/admin/invoice-creation')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Estimate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Drafts</span>
            </div>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Sent</span>
            </div>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-lg font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">All Types</option>
                <option value="draft">Drafts Only</option>
                <option value="live">Live Invoices</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchInvoices} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoices & Estimates</span>
            <Badge variant="outline">{filteredInvoices.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status, invoice.is_draft)}
                        <h4 className="font-medium">{invoice.invoice_number}</h4>
                        <Badge className={getStatusColor(invoice.status, invoice.is_draft)}>
                          {invoice.is_draft ? 'Draft' : invoice.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {invoice.customer_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(invoice.event_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.sent_at 
                          ? `Sent ${new Date(invoice.sent_at).toLocaleDateString()}`
                          : `Updated ${new Date(invoice.updated_at).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium">{invoice.event_name}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customer_email}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {/* Always show View Quote for quote details */}
                    <Button size="sm" variant="outline" onClick={() => handleViewSubmission(invoice)}>
                      <FileText className="h-3 w-3 mr-1" />
                      View Quote
                    </Button>

                    {/* Preview invoice */}
                    <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>

                    {/* Status-based action buttons */}
                    {invoice.is_draft && (
                      <Button size="sm" onClick={() => handleEditInvoice(invoice)}>
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit Draft
                      </Button>
                    )}

                    {!invoice.is_draft && invoice.status === 'draft' && (
                      <>
                        <Button size="sm" onClick={() => handleEditInvoice(invoice)}>
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleSendInvoice(invoice)}>
                          <Send className="h-3 w-3 mr-1" />
                          Send Estimate
                        </Button>
                      </>
                    )}

                    {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'approved' || 
                      invoice.status === 'contract_sent' || invoice.status === 'deposit_paid' || 
                      invoice.status === 'confirmed' || invoice.status === 'completed') && (
                      <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Invoice
                      </Button>
                    )}

                    {invoice.status === 'sent' && (
                      <>
                        <Button size="sm" onClick={() => handleCreatePaymentLink(invoice)}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          Payment Link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSendManualEmail(invoice, 'payment_reminder')}>
                          <Mail className="h-3 w-3 mr-1" />
                          Remind
                        </Button>
                      </>
                    )}

                    {invoice.status === 'approved' && (
                      <Button size="sm" onClick={() => handleCreatePaymentLink(invoice)}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Create Payment Link
                      </Button>
                    )}

                    {(invoice.status === 'approved' || invoice.status === 'contract_sent') && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleMarkDeposited(invoice)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Deposited
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSendManualEmail(invoice, 'follow_up')}>
                          <Mail className="h-3 w-3 mr-1" />
                          Follow Up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No invoices match your filters'
                    : 'No invoices found'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}