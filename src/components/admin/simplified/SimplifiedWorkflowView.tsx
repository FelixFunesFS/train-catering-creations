import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SimpleQuoteList } from './SimpleQuoteList';
import { Search, Filter } from 'lucide-react';

interface Quote {
  id: string;
  event_name: string;
  event_date: string;
  contact_name: string;
  email: string;
  phone: string;
  guest_count: number;
  location: string;
  workflow_status: string;
  created_at: string;
  invoices?: Array<{
    id: string;
    total_amount: number;
    workflow_status: string;
  }>;
}

export function SimplifiedWorkflowView() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadQuotes();

    // Subscribe to changes
    const channel = supabase
      .channel('quote-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_requests' }, () => {
        loadQuotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          id,
          event_name,
          event_date,
          contact_name,
          email,
          phone,
          guest_count,
          location,
          workflow_status,
          created_at,
          invoices!invoices_quote_request_id_fkey(id, total_amount, workflow_status)
        `)
        .neq('workflow_status', 'cancelled')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setQuotes(data as Quote[]);
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          workflow_status: newStatus as any,
          last_status_change: new Date().toISOString(),
          status_changed_by: 'admin',
        })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });

      loadQuotes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateEstimate = async (quoteId: string) => {
    try {
      // Get quote details
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: quoteId,
          document_type: 'estimate',
          workflow_status: 'draft',
          is_draft: true,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      toast({
        title: 'Success',
        description: 'Estimate created. You can now add pricing details.',
      });

      loadQuotes();
    } catch (error) {
      console.error('Error generating estimate:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate estimate',
        variant: 'destructive',
      });
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.workflow_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingQuotes = filteredQuotes.filter((q) => q.workflow_status === 'pending');
  const quotedQuotes = filteredQuotes.filter((q) => q.workflow_status === 'quoted');
  const approvedQuotes = filteredQuotes.filter((q) => q.workflow_status === 'approved');
  const paidQuotes = filteredQuotes.filter((q) => q.workflow_status === 'paid');
  const completedQuotes = filteredQuotes.filter((q) => q.workflow_status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Event Management</h2>
        <p className="text-muted-foreground">Track and manage all catering events from submission to completion</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, contacts, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">New Requests</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            New ({pendingQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="quoted">
            Quoted ({quotedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedQuotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <SimpleQuoteList
            quotes={pendingQuotes}
            onStatusUpdate={handleStatusUpdate}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </TabsContent>

        <TabsContent value="quoted" className="mt-6">
          <SimpleQuoteList
            quotes={quotedQuotes}
            onStatusUpdate={handleStatusUpdate}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <SimpleQuoteList
            quotes={approvedQuotes}
            onStatusUpdate={handleStatusUpdate}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <SimpleQuoteList
            quotes={paidQuotes}
            onStatusUpdate={handleStatusUpdate}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <SimpleQuoteList
            quotes={completedQuotes}
            onStatusUpdate={handleStatusUpdate}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
