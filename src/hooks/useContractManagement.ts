import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useContractManagement(invoiceId: string) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateContract = async () => {
    try {
      setLoading(true);

      const { data: invoice } = await supabase
        .from('invoices')
        .select(`
          *,
          quote_requests(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      const { data: lineItems } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      const contractHtml = generateContractHTML(invoice, lineItems || []);

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          invoice_id: invoiceId,
          contract_type: 'catering_service',
          contract_html: contractHtml,
          status: 'generated',
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Contract Generated',
        description: 'Contract is ready for customer signature.'
      });

      return contract;
    } catch (err: any) {
      console.error('Error generating contract:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signContract = async (contractId: string, signedBy: string) => {
    try {
      setLoading(true);

      const { data: contract, error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_by: signedBy,
          signed_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;

      // Update invoice
      await supabase
        .from('invoices')
        .update({
          contract_signed_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      toast({
        title: 'Contract Signed',
        description: 'Thank you for signing the contract!'
      });

      return contract;
    } catch (err: any) {
      console.error('Error signing contract:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateContract, signContract, loading };
}

function generateContractHTML(invoice: any, lineItems: any[]): string {
  const quote = invoice.quote_requests;
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .section { margin: 20px 0; }
        .terms { background: #f5f5f5; padding: 15px; border-left: 4px solid #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .signature { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
      </style>
    </head>
    <body>
      <h1>Catering Service Agreement</h1>
      
      <div class="section">
        <h2>Event Details</h2>
        <p><strong>Event Name:</strong> ${quote.event_name}</p>
        <p><strong>Client:</strong> ${quote.contact_name}</p>
        <p><strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${quote.start_time}</p>
        <p><strong>Location:</strong> ${quote.location}</p>
        <p><strong>Guest Count:</strong> ${quote.guest_count}</p>
      </div>

      <div class="section">
        <h2>Services & Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td>${item.title || item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="2">Total</th>
              <th>${formatCurrency(invoice.total_amount)}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="section terms">
        <h2>Terms & Conditions</h2>
        <p>1. <strong>Deposit:</strong> A deposit is required to secure the event date.</p>
        <p>2. <strong>Cancellation:</strong> Cancellations must be made at least 7 days prior to the event.</p>
        <p>3. <strong>Menu Changes:</strong> Final menu selections must be confirmed 3 days before the event.</p>
        <p>4. <strong>Payment:</strong> Final payment is due on or before the event date.</p>
        <p>5. <strong>Setup:</strong> Access to the venue is required 2 hours before service time.</p>
      </div>

      <div class="signature">
        <p>By signing below, you agree to the terms and conditions outlined in this agreement.</p>
        <p><strong>Soul Train's Eatery</strong><br>Charleston, SC<br>(843) 970-0265</p>
      </div>
    </body>
    </html>
  `;
}
