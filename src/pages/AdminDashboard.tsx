import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Search, Eye, Filter, Download, Calendar, MapPin, Users, Mail, Phone, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { QuoteDetailModal } from "@/components/admin/QuoteDetailModal";
import { QuoteViewModal } from "@/components/admin/QuoteViewModal";
import { useNavigate } from "react-router-dom";

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

const AdminDashboard = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteRequest[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [viewQuote, setViewQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [invoiceStatus, setInvoiceStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter, serviceFilter]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data as QuoteRequest[] || []);

      // Fetch invoice status for each quote
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('quote_request_id, status, is_draft')
        .in('quote_request_id', data?.map(q => q.id) || []);

      const statusMap: Record<string, string> = {};
      invoiceData?.forEach(invoice => {
        if (invoice.quote_request_id) {
          statusMap[invoice.quote_request_id] = invoice.is_draft ? 'draft' : invoice.status;
        }
      });
      setInvoiceStatus(statusMap);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quote requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter(quote => quote.service_type === serviceFilter);
    }

    setFilteredQuotes(filtered);
  };

  const updateQuoteStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus as QuoteRequest['status'] })
        .eq('id', id);

      if (error) throw error;

      setQuotes(quotes.map(quote => 
        quote.id === id ? { ...quote, status: newStatus as QuoteRequest['status'] } : quote
      ));

      toast({
        title: "Status Updated",
        description: `Quote status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'quoted': return 'default';
      case 'completed': return 'default';
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    switch (serviceType) {
      case 'full-service': return 'Full Service Catering';
      case 'delivery-setup': return 'Delivery + Setup';
      case 'drop-off': return 'Drop-Off Service';
      default: return serviceType;
    }
  };

  const getActionButton = (quote: QuoteRequest) => {
    const hasInvoice = invoiceStatus[quote.id];
    
    if (!hasInvoice && quote.status === 'pending') {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/admin/invoice-creation/${quote.id}`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          Generate Estimate
        </Button>
      );
    }
    
    if (hasInvoice === 'draft') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/invoices`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          View Estimate
        </Button>
      );
    }
    
    if (hasInvoice && hasInvoice !== 'draft') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/invoices`)}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          View Invoice
        </Button>
      );
    }
    
    return null;
  };

  const exportToCSV = () => {
    const headers = ['Contact Name', 'Email', 'Phone', 'Event Name', 'Event Type', 'Event Date', 'Guests', 'Service Type', 'Location', 'Status', 'Created'];
    const csvData = filteredQuotes.map(quote => [
      quote.contact_name,
      quote.email,
      quote.phone,
      quote.event_name,
      quote.event_type,
      format(new Date(quote.event_date), 'MMM dd, yyyy'),
      quote.guest_count,
      getServiceTypeDisplay(quote.service_type),
      quote.location,
      quote.status,
      format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: "Dashboard", current: true }
          ]} 
        />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-elegant font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage quote requests for Soul Train's Eatery</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/admin/invoices')} variant="default" className="gap-2">
              <FileText className="h-4 w-4" />
              Invoice Management
            </Button>
            <Button onClick={() => navigate('/admin/contracts')} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Contracts
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="neumorphic-card-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-secondary">Total</Badge>
                <span className="text-2xl font-bold">{quotes.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">All Requests</p>
            </CardContent>
          </Card>
          <Card className="neumorphic-card-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <span className="text-2xl font-bold">{quotes.filter(q => q.status === 'pending').length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Need Review</p>
            </CardContent>
          </Card>
          <Card className="neumorphic-card-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                <span className="text-2xl font-bold">{quotes.filter(q => q.status === 'reviewed').length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Under Review</p>
            </CardContent>
          </Card>
          <Card className="neumorphic-card-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                <span className="text-2xl font-bold">{quotes.filter(q => q.status === 'completed').length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Finalized</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="neumorphic-card-1">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, event, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="full-service">Full Service</SelectItem>
                  <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
                  <SelectItem value="drop-off">Drop-Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quote Requests Table */}
        <Card className="neumorphic-card-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Quote Requests ({filteredQuotes.length})
            </CardTitle>
            <CardDescription>
              Manage and track all quote requests from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{quote.contact_name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {quote.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {quote.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{quote.event_name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(quote.event_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {quote.guest_count} guests
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {quote.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getServiceTypeDisplay(quote.service_type)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {quote.event_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(quote.status)}>
                          {quote.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewQuote(quote)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Submission
                          </Button>
                          {getActionButton(quote)}
                          <Select 
                            value={quote.status} 
                            onValueChange={(value) => updateQuoteStatus(quote.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quote Detail Modal */}
        {selectedQuote && (
          <QuoteDetailModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
            onUpdate={(updatedQuote) => {
              setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
              setSelectedQuote(updatedQuote);
            }}
          />
        )}

        {/* Quote View Modal */}
        {viewQuote && (
          <QuoteViewModal
            quote={viewQuote}
            onClose={() => setViewQuote(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;