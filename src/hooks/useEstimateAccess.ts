import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstimateData {
  invoice: any;
  quote: any;
  lineItems: any[];
  milestones: any[];
  totalPaid?: number;
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

      // Use RPC function to securely fetch all data in one call
      const { data, error: rpcError } = await supabase
        .rpc('get_estimate_with_line_items', {
          access_token: accessToken
        });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        if (rpcError.message.includes('Invalid') || rpcError.message.includes('expired')) {
          setError('invalid_token');
        } else {
          setError('fetch_failed');
        }
        toast({
          title: 'Error',
          description: rpcError.message.includes('expired') 
            ? 'This estimate link has expired' 
            : 'Failed to load estimate details',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError('Estimate not found');
        toast({
          title: 'Error',
          description: 'Estimate not found',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const result = data[0];
      const invoice = result.invoice as any;
      const quote = result.quote as any;
      const lineItems = (result.line_items || []) as any[];
      const milestones = (result.milestones || []) as any[];
      const totalPaid = result.total_paid as number | null;
      
      // Ensure critical quote fields have safe defaults to prevent .charAt() errors
      const safeQuote = {
        ...quote,
        contact_name: quote.contact_name || '',
        event_name: quote.event_name || '',
        event_date: quote.event_date || new Date().toISOString(),
        guest_count: quote.guest_count || 0,
        location: quote.location || '',
        service_type: quote.service_type || '',
        event_type: quote.event_type || '',
        start_time: quote.start_time || '',
        email: quote.email || '',
        phone: quote.phone || '',
        workflow_status: quote.workflow_status || 'draft',
        vegetarian_entrees: quote.vegetarian_entrees || [],
      };
      
      setEstimateData({
        invoice,
        quote: safeQuote,
        lineItems,
        milestones,
        totalPaid: totalPaid ?? undefined,
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
      setError('fetch_failed');
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
