import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  AlertCircle, 
  Clock, 
  User, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Send,
  Trash2
} from 'lucide-react';

interface DraftInvoice {
  id: string;
  invoice_number: string;
  quote_request_id: string;
  customer_name: string;
  event_name: string;
  event_date: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_quote_sync?: string;
  override_reason?: string;
  is_draft: boolean;
}

interface InvoiceDraftManagerProps {
  onEditDraft: (draft: DraftInvoice) => void;
  onDeleteDraft: (draftId: string) => void;
  onGenerateFromDraft: (draftId: string) => void;
}

export function InvoiceDraftManager({ onEditDraft, onDeleteDraft, onGenerateFromDraft }: InvoiceDraftManagerProps) {
  const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(name, quote_request_id),
          quote_requests!inner(event_name, event_date, contact_name)
        `)
        .eq('is_draft', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedDrafts: DraftInvoice[] = data.map((item: any) => ({
        id: item.id,
        invoice_number: item.invoice_number,
        quote_request_id: item.quote_request_id,
        customer_name: item.quote_requests.contact_name,
        event_name: item.quote_requests.event_name,
        event_date: item.quote_requests.event_date,
        total_amount: item.total_amount,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_quote_sync: item.last_quote_sync,
        override_reason: item.override_reason,
        is_draft: item.is_draft
      }));

      setDrafts(formattedDrafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch draft invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || draft.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Draft deleted successfully"
      });

      fetchDrafts();
      onDeleteDraft(draftId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Draft Invoice Manager
          </div>
          <Button size="sm" variant="outline" onClick={fetchDrafts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Drafts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by customer, event, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter">Status Filter</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div className="flex items-end">
            <Badge variant="outline" className="text-sm">
              {filteredDrafts.length} draft{filteredDrafts.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Draft List */}
        <div className="space-y-4">
          {filteredDrafts.length > 0 ? (
            filteredDrafts.map((draft) => (
              <div key={draft.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{draft.invoice_number}</h4>
                      <Badge className={getStatusColor(draft.status)}>
                        {draft.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {draft.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(draft.event_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(draft.total_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Updated {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium">{draft.event_name}</p>
                  {draft.override_reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {draft.override_reason}
                    </p>
                  )}
                  {draft.last_quote_sync && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Last synced: {new Date(draft.last_quote_sync).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEditDraft(draft)}>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => onGenerateFromDraft(draft.id)}>
                    <Send className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No drafts match your filters'
                  : 'No draft invoices found'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}