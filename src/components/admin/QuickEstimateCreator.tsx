import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PricingEngine } from "@/services/PricingEngine";
import { PricingBreakdown } from "./PricingBreakdown";
import { useToast } from "@/hooks/use-toast";

interface QuickEstimateCreatorProps {
  quoteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const QuickEstimateCreator = ({ 
  quoteId, 
  open, 
  onOpenChange,
  onSuccess 
}: QuickEstimateCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadQuoteAndCalculate();
    }
  }, [open, quoteId]);

  const loadQuoteAndCalculate = async () => {
    setIsLoading(true);
    try {
      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();

      if (quoteError) {
        console.error('Error fetching quote:', quoteError);
        throw new Error('Failed to fetch quote');
      }

      if (!quoteData) {
        throw new Error('Quote not found');
      }

      setQuote(quoteData);

      const { data: pricingRules } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true);

      const engine = new PricingEngine(pricingRules || []);
      const calc = engine.calculateQuote(quoteData);
      setCalculation(calc);
    } catch (error) {
      console.error('Error loading quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!calculation || !quote) return;

    setIsSending(true);
    try {
      const invoiceData = {
        quote_request_id: quoteId,
        document_type: 'estimate' as const,
        status: 'draft',
        is_draft: true,
        subtotal: Math.round(calculation.subtotal * 100),
        tax_amount: Math.round(calculation.taxAmount * 100),
        total_amount: Math.round(calculation.total * 100),
        notes: calculation.suggestions.join('\n'),
        draft_data: JSON.parse(JSON.stringify({ calculation }))
      };

      const { data: invoiceArray, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select();

      if (invoiceError || !invoiceArray || invoiceArray.length === 0) {
        console.error('Invoice error:', invoiceError);
        throw invoiceError || new Error('No invoice returned');
      }

      const invoice = invoiceArray[0];

      // Create line items
      const lineItems = calculation.lineItems.map((item: any) => ({
        invoice_id: invoice.id,
        title: item.category,
        description: item.description + (item.notes ? ` - ${item.notes}` : ''),
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice * 100),
        total_price: Math.round(item.total * 100),
        category: item.category.toLowerCase()
      }));

      await supabase.from('invoice_line_items').insert(lineItems);

      toast({
        title: "Draft Saved",
        description: "Estimate saved as draft"
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save estimate",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToCustomer = async () => {
    await handleSaveDraft();
    // TODO: Integrate with email sending
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
          <DialogDescription>
            Review the auto-generated pricing and send to customer
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : calculation ? (
          <div className="space-y-4">
            <PricingBreakdown calculation={calculation} />

            <div className="flex gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={isSending}
                variant="outline"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={handleSendToCustomer}
                disabled={isSending}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send to Customer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load quote data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
