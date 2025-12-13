import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];
type QuoteWorkflowStatus = Database['public']['Enums']['quote_workflow_status'];

// Query keys factory for consistent cache management
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
  byStatus: (status: QuoteWorkflowStatus) => [...quoteKeys.all, 'status', status] as const,
  pending: () => [...quoteKeys.all, 'pending'] as const,
  count: () => [...quoteKeys.all, 'count'] as const,
};

// Fetch all quotes with optional filters
export function useQuotes(filters?: {
  status?: QuoteWorkflowStatus;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: quoteKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('workflow_status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`contact_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,event_name.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as QuoteRequest[];
    },
  });
}

// Fetch a single quote by ID
export function useQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteKeys.detail(quoteId || ''),
    queryFn: async () => {
      if (!quoteId) return null;

      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      return data as QuoteRequest;
    },
    enabled: !!quoteId,
  });
}

// Fetch quotes by status
export function useQuotesByStatus(status: QuoteWorkflowStatus) {
  return useQuery({
    queryKey: quoteKeys.byStatus(status),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('workflow_status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QuoteRequest[];
    },
  });
}

// Fetch pending quotes count
export function usePendingQuotesCount() {
  return useQuery({
    queryKey: quoteKeys.pending(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('workflow_status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch quote with related invoice
export function useQuoteWithInvoice(quoteId: string | undefined) {
  return useQuery({
    queryKey: [...quoteKeys.detail(quoteId || ''), 'with-invoice'],
    queryFn: async () => {
      if (!quoteId) return null;

      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, invoice_line_items(*)')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      return { quote: quote as QuoteRequest, invoice };
    },
    enabled: !!quoteId,
  });
}

// Update quote mutation
export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      updates,
    }: {
      quoteId: string;
      updates: Partial<QuoteRequest>;
    }) => {
      const { data, error } = await supabase
        .from('quote_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data as QuoteRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast({
        title: 'Quote updated',
        description: 'Quote has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update quote status mutation
export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      status,
      reason,
    }: {
      quoteId: string;
      status: QuoteWorkflowStatus;
      reason?: string;
    }) => {
      // Get current status for logging
      const { data: current } = await supabase
        .from('quote_requests')
        .select('workflow_status')
        .eq('id', quoteId)
        .single();

      const previousStatus = current?.workflow_status;

      // Update quote status
      const { data, error } = await supabase
        .from('quote_requests')
        .update({
          workflow_status: status,
          last_status_change: new Date().toISOString(),
          status_changed_by: 'admin',
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;

      // Log the status change
      await supabase.from('workflow_state_log').insert({
        entity_type: 'quote',
        entity_id: quoteId,
        previous_status: previousStatus,
        new_status: status,
        changed_by: 'admin',
        change_reason: reason,
      });

      return data as QuoteRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast({
        title: 'Status updated',
        description: `Quote status changed to ${data.workflow_status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete quote mutation
export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // First delete related records
      await supabase.from('quote_line_items').delete().eq('quote_request_id', quoteId);
      await supabase.from('admin_notes').delete().eq('quote_request_id', quoteId);

      // Delete quote
      const { error } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;
      return quoteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast({
        title: 'Quote deleted',
        description: 'Quote has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Create quote mutation (for admin-created quotes)
export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteData: Database['public']['Tables']['quote_requests']['Insert']) => {
      const { data, error } = await supabase
        .from('quote_requests')
        .insert(quoteData)
        .select()
        .single();

      if (error) throw error;
      return data as QuoteRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast({
        title: 'Quote created',
        description: 'New quote has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Bulk update quotes mutation
export function useBulkUpdateQuotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteIds,
      updates,
    }: {
      quoteIds: string[];
      updates: Partial<QuoteRequest>;
    }) => {
      const { data, error } = await supabase
        .from('quote_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .in('id', quoteIds)
        .select();

      if (error) throw error;
      return data as QuoteRequest[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast({
        title: 'Quotes updated',
        description: `${data.length} quotes have been updated.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating quotes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
