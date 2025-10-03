import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstimateData {
  invoice: any;
  quote: any;
  lineItems: any[];
  milestones: any[];
}

export function useEstimateAccess(accessToken: string) {
  const [loading, setLoading] = useState(true);
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!accessToken) {
      setError('No access token provided');
      setLoading(false);
      return;
    }

    fetchEstimateData();
  }, [accessToken]);

  const fetchEstimateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoice using access token
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_access_token', accessToken)
        .eq('document_type', 'estimate')
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoice) {
        setError('Estimate not found');
        setLoading(false);
        return;
      }

      // Fetch related quote request
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', invoice.quote_request_id)
        .single();

      if (quoteError) throw quoteError;

      // Fetch line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('category', { ascending: true });

      if (lineItemsError) throw lineItemsError;

      // Fetch payment milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('milestone_type', { ascending: true });

      if (milestonesError) throw milestonesError;

      setEstimateData({
        invoice,
        quote,
        lineItems: lineItems || [],
        milestones: milestones || []
      });

      // Track view analytics
      await supabase.from('analytics_events').insert({
        event_type: 'estimate_viewed',
        entity_type: 'invoice',
        entity_id: invoice.id,
        metadata: { access_token: accessToken }
      });

      // Update view count
      await supabase
        .from('invoices')
        .update({
          estimate_viewed_at: new Date().toISOString(),
          estimate_viewed_count: (invoice.estimate_viewed_count || 0) + 1,
          last_customer_interaction: new Date().toISOString()
        })
        .eq('id', invoice.id);

    } catch (err: any) {
      console.error('Error fetching estimate:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load estimate details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, estimateData, error, refetch: fetchEstimateData };
}
