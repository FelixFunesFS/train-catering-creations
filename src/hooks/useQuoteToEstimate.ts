import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuLineItemsGenerator } from '@/services/MenuLineItemsGenerator';

export const useQuoteToEstimate = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const convertQuoteToEstimate = async (quoteId: string) => {
    setIsConverting(true);

    try {
      // Fetch quote request details
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Failed to fetch quote request');
      }

      // Generate line items from menu selections (all $0 pricing for manual entry)
      const generatedLineItems = MenuLineItemsGenerator.generateFromQuote(quote);

      // Create estimate with $0 totals (admin will manually price)
      const invoiceData = {
        quote_request_id: quoteId,
        document_type: 'estimate' as const,
        status: 'draft',
        is_draft: true,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        currency: 'usd',
        notes: 'Manual pricing required - update line item prices',
        draft_data: JSON.parse(JSON.stringify({
          generated_at: new Date().toISOString(),
          awaiting_pricing: true
        }))
      };

      const { data: invoiceArray, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select();

      if (invoiceError || !invoiceArray || invoiceArray.length === 0) {
        console.error('Invoice error:', invoiceError);
        throw new Error('Failed to create estimate');
      }

      const invoice = invoiceArray[0];

      // Create line items with $0 pricing
      const lineItems = generatedLineItems.map(item => ({
        invoice_id: invoice.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        category: item.category
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);

      if (lineItemsError) {
        console.error('Error creating line items:', lineItemsError);
      }

      // Update quote status
      await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'estimated',
          estimated_total: 0
        })
        .eq('id', quoteId);

      toast({
        title: "Estimate Created",
        description: "Quote converted to estimate successfully"
      });

      return invoice;
    } catch (error) {
      console.error('Error converting quote to estimate:', error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to create estimate",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertQuoteToEstimate,
    isConverting
  };
};
