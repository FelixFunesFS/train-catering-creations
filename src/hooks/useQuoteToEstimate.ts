import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PricingEngine } from '@/services/PricingEngine';

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

      // Fetch pricing rules
      const { data: pricingRules, error: rulesError } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true);

      if (rulesError) {
        console.error('Error fetching pricing rules:', rulesError);
      }

      // Calculate pricing
      const engine = new PricingEngine(pricingRules || []);
      const calculation = engine.calculateQuote(quote);

      // Create estimate (invoice with document_type='estimate')
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: quoteId,
          document_type: 'estimate',
          status: 'draft',
          is_draft: true,
          subtotal: calculation.subtotal,
          tax_amount: calculation.taxAmount,
          total_amount: calculation.total,
          currency: 'usd',
          notes: calculation.suggestions.join('\n'),
          draft_data: {
            calculation,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Failed to create estimate');
      }

      // Create line items
      const lineItems = calculation.lineItems.map(item => ({
        invoice_id: invoice.id,
        title: item.category,
        description: item.description + (item.notes ? ` - ${item.notes}` : ''),
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice * 100), // Convert to cents
        total_price: Math.round(item.total * 100),
        category: item.category.toLowerCase()
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
          status: 'quoted',
          estimated_total: calculation.total
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
