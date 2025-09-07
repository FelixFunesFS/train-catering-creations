import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { InvoicePreviewModal } from '@/components/admin/InvoicePreviewModal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StandardizedActions } from '@/components/admin/StandardizedActions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Send, 
  CreditCard,
  Download,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface InvoiceManagementTabProps {
  invoices: any[];
  quotes?: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  selectedItems?: string[];
  onSelectionChange?: (items: string[]) => void;
  title?: string;
  description?: string;
}

export function InvoiceManagementTab({ 
  invoices, 
  quotes = [],
  loading, 
  onRefresh, 
  selectedItems = [],
  onSelectionChange = () => {},
  title = "Invoice Management",
  description = "Manage and track all invoices"
}: InvoiceManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredAndSortedInvoices = invoices
    .filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.quote_requests?.event_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'customer_name') {
        aValue = a.customers?.name || '';
        bValue = b.customers?.name || '';
      } else if (sortField === 'event_name') {
        aValue = a.quote_requests?.event_name || '';
        bValue = b.quote_requests?.event_name || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredAndSortedInvoices.map(inv => inv.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (invoiceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, invoiceId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== invoiceId));
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleQuickAction = async (invoice: any, action: string) => {
    try {
      switch (action) {
        case 'send':
          await supabase.functions.invoke('send-invoice-email', {
            body: { invoice_id: invoice.id }
          });
          toast({
            title: "Invoice Sent",
            description: `Invoice sent to ${invoice.customers?.email}`,
          });
          break;
          
        case 'payment_link':
          const { data } = await supabase.functions.invoke('create-payment-link', {
            body: { 
              invoice_id: invoice.id,
              amount: invoice.total_amount 
            }
          });
          if (data?.url) {
            navigator.clipboard.writeText(data.url);
            toast({
              title: "Payment Link Created",
              description: "Link copied to clipboard",
            });
          }
          break;
          
        case 'download':
          await supabase.functions.invoke('generate-invoice-pdf', {
            body: { invoice_id: invoice.id }
          });
          toast({
            title: "PDF Generated",
            description: "Invoice PDF is being prepared",
          });
          break;
      }
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    invoices.forEach(invoice => {
      counts[invoice.status] = (counts[invoice.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Filters and Search - Contained properly */}
      <Card className="bg-background border shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search invoices, customers, events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 h-10 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All ({invoices.length})</option>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <option key={status} value={status}>
                    {status} ({count})
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                size="sm"
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Items Table - Mobile responsive */}
      <Card className="bg-background border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{title}</span>
            <Badge variant="outline" className="text-xs">
              {filteredAndSortedInvoices.length + quotes.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 px-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="space-y-0">
                  {/* Table Header */}
                  <div className="flex items-center gap-4 py-3 px-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="w-8">
                      <Checkbox
                        checked={selectedItems.length === filteredAndSortedInvoices.length && filteredAndSortedInvoices.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <button
                        onClick={() => handleSort('invoice_number')}
                        className="flex items-center gap-1 text-left hover:text-primary transition-colors"
                      >
                        Invoice #
                        {sortField === 'invoice_number' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('customer_name')}
                        className="flex items-center gap-1 text-left hover:text-primary transition-colors"
                      >
                        Customer
                        {sortField === 'customer_name' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('total_amount')}
                        className="flex items-center gap-1 text-left hover:text-primary transition-colors"
                      >
                        Amount
                        {sortField === 'total_amount' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 text-left hover:text-primary transition-colors"
                      >
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                      <div>Actions</div>
                    </div>
                  </div>

                  {/* Invoice Rows */}
                  {filteredAndSortedInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center gap-4 py-3 px-4 border-b hover:bg-muted/30 transition-colors">
                      <div className="w-8">
                        <Checkbox
                          checked={selectedItems.includes(invoice.id)}
                          onCheckedChange={(checked) => handleSelectItem(invoice.id, !!checked)}
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-medium">{invoice.invoice_number || 'Draft'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(invoice.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{invoice.customers?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.quote_requests?.event_name}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                          {invoice.quote_requests?.event_date && (
                            <p className="text-xs text-muted-foreground">
                              Event: {formatDate(invoice.quote_requests.event_date)}
                            </p>
                          )}
                        </div>
                        <div>
                          <StatusBadge 
                            status={invoice.status} 
                            isDraft={invoice.is_draft}
                            size="sm"
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/estimate-preview/${invoice.id}`, '_blank')}
                            title="Manage Estimate"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3 p-4">
                {/* Quotes under review */}
                {quotes.map((quote) => (
                  <Card key={`quote-${quote.id}`} className="shadow-sm border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{quote.event_name}</p>
                          <p className="text-xs text-muted-foreground">Quote Request</p>
                        </div>
                        <StatusBadge 
                          status={quote.status} 
                          size="sm"
                        />
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <p className="font-medium text-sm">{quote.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{quote.guest_count} guests</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">
                            {quote.estimated_total ? formatCurrency(quote.estimated_total) : 'Pending'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Event: {formatDate(quote.event_date)}
                          </span>
                        </div>
                      </div>
                      
                      <StandardizedActions 
                        type="quote" 
                        item={quote} 
                        onRefresh={onRefresh}
                        size="sm"
                      />
                    </CardContent>
                  </Card>
                ))}
                
                {/* Invoices */}
                {filteredAndSortedInvoices.map((invoice) => (
                  <Card key={invoice.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedItems.includes(invoice.id)}
                            onCheckedChange={(checked) => handleSelectItem(invoice.id, !!checked)}
                          />
                          <div>
                            <p className="font-semibold text-sm">{invoice.invoice_number || 'Draft'}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(invoice.created_at)}</p>
                          </div>
                        </div>
                        <StatusBadge 
                          status={invoice.status} 
                          isDraft={invoice.is_draft}
                          size="sm"
                        />
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <p className="font-medium text-sm">{invoice.customers?.name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.quote_requests?.event_name}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">{formatCurrency(invoice.total_amount)}</span>
                          {invoice.quote_requests?.event_date && (
                            <span className="text-xs text-muted-foreground">
                              Event: {formatDate(invoice.quote_requests.event_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/admin/estimate-preview/${invoice.id}`, '_blank')}
                          title="Manage Estimate"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="ml-1">Manage</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAndSortedInvoices.length === 0 && quotes.length === 0 && (
                <div className="text-center py-8 px-4">
                  <p className="text-muted-foreground">No items found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <InvoicePreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}