import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceViewer } from '@/components/admin/invoice/InvoiceViewer';
import { Loader2 } from 'lucide-react';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface EstimateData {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  due_date: string;
  sent_at: string | null;
  created_at: string;
  notes: string;
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  quote_requests: {
    id: string;
    event_name: string;
    event_date: string;
    location: string;
    service_type: string;
    guest_count: number;
    special_requests: string;
    contact_name: string;
    email: string;
  };
}

export default function EstimatePrintView() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      fetchEstimate();
    }
  }, [invoiceId]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id (
            id,
            name,
            email,
            phone,
            address
          ),
          quote_requests!quote_request_id (
            id,
            event_name,
            event_date,
            location,
            service_type,
            guest_count,
            special_requests,
            contact_name,
            email
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Estimate not found');

      // Fetch line items separately
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (lineItemsError) throw lineItemsError;

      setEstimate(data);
      setLineItems(lineItemsData || []);
    } catch (error) {
      console.error('Error fetching estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger print dialog when component loads
  useEffect(() => {
    if (!loading && estimate) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, estimate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center print:hidden">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading estimate...</span>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center print:hidden">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Estimate Not Found</h3>
          <p className="text-muted-foreground">
            The estimate you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const documentType = estimate.status === 'approved' || estimate.status === 'paid' ? 'invoice' : 'estimate';

  return (
    <div className="print-only-view">
      <InvoiceViewer
        invoice={{
          ...estimate,
          line_items: lineItems
        }}
        customer={estimate.customers}
        quote={estimate.quote_requests}
        documentType={documentType}
        showActions={false}
      />
    </div>
  );
}