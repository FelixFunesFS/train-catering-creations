import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PaymentMilestoneManager } from './PaymentMilestoneManager';
import { useInvoices, usePaymentStats } from '@/hooks/useInvoices';
import {
  Search,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function PaymentProcessingDashboard() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Use hooks for data fetching
  const { data: invoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices({ 
    status: 'approved' 
  });
  const { data: stats, isLoading: statsLoading } = usePaymentStats();

  // Find selected invoice from the list
  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.invoice_id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  );

  // Auto-select first invoice if none selected
  React.useEffect(() => {
    if (invoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].invoice_id);
    }
  }, [invoices, selectedInvoiceId]);

  const filteredInvoices = useMemo(() => invoices.filter(invoice => {
    const matchesSearch = 
      invoice.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.workflow_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }), [invoices, searchTerm, statusFilter]);

  const loading = invoicesLoading || statsLoading;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading payment dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Processing</h1>
          <p className="text-muted-foreground">
            Manage payment schedules, contracts, and collections
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold">{formatCurrency((stats?.totalOutstanding || 0) / 100)}</div>
                <div className="text-xs text-muted-foreground">Total Outstanding</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-semibold">{stats?.pendingCount || 0}</div>
                <div className="text-xs text-muted-foreground">Pending Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-semibold">{stats?.overdueCount || 0}</div>
                <div className="text-xs text-muted-foreground">Overdue Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold">{invoices.length}</div>
                <div className="text-xs text-muted-foreground">Active Contracts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Approved Estimates</CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, event, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  onClick={() => setSelectedInvoiceId(invoice.invoice_id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInvoiceId === invoice.invoice_id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">
                      {invoice.event_name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {invoice.workflow_status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{invoice.contact_name}</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(invoice.event_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(invoice.total_amount / 100)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMilestoneManager
                  invoiceId={selectedInvoice.invoice_id}
                  quoteRequest={{
                    id: selectedInvoice.quote_id || '',
                    contact_name: selectedInvoice.contact_name,
                    email: selectedInvoice.email,
                    event_name: selectedInvoice.event_name,
                    event_date: selectedInvoice.event_date,
                    location: selectedInvoice.location,
                    guest_count: selectedInvoice.guest_count,
                    compliance_level: selectedInvoice.compliance_level || ''
                  }}
                  onPaymentProcessed={() => refetchInvoices()}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select an approved estimate to manage payments and contracts
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}