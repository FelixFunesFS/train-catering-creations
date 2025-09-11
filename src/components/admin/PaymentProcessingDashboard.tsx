import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PaymentMilestoneManager } from './PaymentMilestoneManager';
import { ContractManagement } from './ContractManagement';
import { 
  Search,
  Filter,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Invoice {
  id: string;
  quote_request_id: string;
  total_amount: number;
  status: string;
  document_type: string;
  created_at: string;
  due_date: string | null;
  quote_requests: {
    id: string;
    contact_name: string;
    email: string;
    event_name: string;
    event_date: string;
    location: string;
    guest_count: number;
    compliance_level: string;
  };
}

interface PaymentMilestone {
  id: string;
  invoice_id: string;
  milestone_type: string;
  amount_cents: number;
  status: string;
  is_due_now: boolean;
  due_date: string | null;
}

export function PaymentProcessingDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (selectedInvoice) {
      loadMilestones(selectedInvoice.id);
    }
  }, [selectedInvoice]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // First get invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          quote_request_id,
          total_amount,
          status,
          document_type,
          created_at,
          due_date
        `)
        .eq('status', 'approved')
        .eq('document_type', 'estimate')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Then get quote requests for those invoices
      if (invoicesData && invoicesData.length > 0) {
        const quoteRequestIds = invoicesData.map(inv => inv.quote_request_id);
        
        const { data: quotesData, error: quotesError } = await supabase
          .from('quote_requests')
          .select(`
            id,
            contact_name,
            email,
            event_name,
            event_date,
            location,
            guest_count,
            compliance_level
          `)
          .in('id', quoteRequestIds);

        if (quotesError) throw quotesError;

        // Merge the data
        const mergedData = invoicesData.map(invoice => ({
          ...invoice,
          quote_requests: quotesData?.find(quote => quote.id === invoice.quote_request_id) || {} as any
        }));

        setInvoices(mergedData as Invoice[]);
        
        if (mergedData.length > 0 && !selectedInvoice) {
          setSelectedInvoice(mergedData[0] as Invoice);
        }
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load approved estimates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.quote_requests.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.quote_requests.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.quote_requests.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPaymentStats = () => {
    const totalValue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingPayments = milestones.filter(m => m.status === 'pending' || m.is_due_now).length;
    const overduePayments = milestones.filter(m => {
      if (!m.due_date) return false;
      return new Date(m.due_date) < new Date() && m.status !== 'paid';
    }).length;
    
    return { totalValue, pendingPayments, overduePayments };
  };

  const stats = getPaymentStats();

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
                <div className="font-semibold">{formatCurrency(stats.totalValue / 100)}</div>
                <div className="text-xs text-muted-foreground">Total Contract Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-semibold">{stats.pendingPayments}</div>
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
                <div className="font-semibold">{stats.overduePayments}</div>
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
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInvoice?.id === invoice.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">
                      {invoice.quote_requests.event_name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{invoice.quote_requests.contact_name}</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(invoice.quote_requests.event_date).toLocaleDateString()}
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payments">Payment Schedule</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payments" className="space-y-4">
                <PaymentMilestoneManager
                  invoiceId={selectedInvoice.id}
                  quoteRequest={selectedInvoice.quote_requests}
                  onPaymentProcessed={() => {
                    loadInvoices();
                    if (selectedInvoice) {
                      loadMilestones(selectedInvoice.id);
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="contracts" className="space-y-4">
                <ContractManagement
                  invoiceId={selectedInvoice.id}
                  quoteRequest={selectedInvoice.quote_requests}
                  onContractSigned={() => {
                    loadInvoices();
                  }}
                />
              </TabsContent>
            </Tabs>
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