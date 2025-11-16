import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type QuoteRequest } from '@/utils/invoiceFormatters';
import { useEnhancedPricingManagement } from '@/hooks/useEnhancedPricingManagement';
import { useInvoiceEditing } from '@/hooks/useInvoiceEditing';
import { useWorkflowSync } from '@/hooks/useWorkflowSync';
import { supabase } from '@/integrations/supabase/client';
import { EmailPreviewModal } from './EmailPreviewModal';
import { WorkflowSteps } from './workflow/WorkflowSteps';
import { QuoteSelectionPanel } from './workflow/QuoteSelectionPanel';
import { PricingPanel } from './workflow/PricingPanel';

import { TermsAndConditionsPanel } from './workflow/TermsAndConditionsPanel';
import { PaymentCollectionPanel } from './workflow/PaymentCollectionPanel';
import { EventConfirmationPanel } from './workflow/EventConfirmationPanel';
import { EventCompletionPanel } from './workflow/EventCompletionPanel';
// WeddingTemplateSelector removed - now inline in PricingPanel
import { TimelineTasksPanel } from './workflow/TimelineTasksPanel';
import { WorkflowService } from '@/services/WorkflowService';
import { InvoiceTotalsRecalculator } from '@/services/InvoiceTotalsRecalculator';

type Quote = QuoteRequest & {
  created_at: string;
};

interface Invoice {
  id: string;
  quote_request_id: string;
  workflow_status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  is_draft: boolean;
  document_type: string;
}

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface UnifiedWorkflowManagerProps {
  selectedQuoteId?: string;
  mode?: 'pricing' | 'default';
}

export function UnifiedWorkflowManager({ selectedQuoteId, mode = 'default' }: UnifiedWorkflowManagerProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'pricing' | 'government' | 'contract' | 'payment' | 'confirmed' | 'completed'>('select');
  const [loading, setLoading] = useState(true);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  // Template selector removed - now inline in PricingPanel
  const [showTimelineTasks, setShowTimelineTasks] = useState(false);
  const [requiresContract, setRequiresContract] = useState(false);
  const { toast } = useToast();
  const { syncQuoteWithInvoice } = useWorkflowSync();

  const {
    lineItems: managedLineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    addTemplateItem,
    isModified,
    triggerAutoSave,
    quickCalculatePerPerson,
    validatePricing
  } = useEnhancedPricingManagement({
    initialLineItems: lineItems,
    guestCount: selectedQuote?.guest_count || 0,
    autoSave: true,
    invoiceId: invoice?.id,
  });

  const { saveInvoiceChanges } = useInvoiceEditing();

  // Trust database as single source of truth - trigger handles all calculations
  const totals = useMemo(() => {
    if (!invoice) return { subtotal: 0, tax_amount: 0, total_amount: 0 };
    return {
      subtotal: invoice.subtotal || 0,
      tax_amount: invoice.tax_amount || 0,
      total_amount: invoice.total_amount || 0
    };
  }, [invoice]);

  // Subscribe to invoice updates (triggered by line item changes via database trigger)
  useEffect(() => {
    if (!invoice?.id) return;

    const channel = supabase
      .channel('invoice-totals-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `id=eq.${invoice.id}`
        },
        (payload) => {
          console.log('📊 Invoice totals updated by database trigger:', payload.new);
          refetchInvoice(invoice.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoice?.id]);

  // Load quotes on mount and auto-generate invoices
  useEffect(() => {
    fetchQuotes();
    if (selectedQuoteId) {
      fetchQuoteById(selectedQuoteId);
      if (mode === 'pricing') {
        setCurrentStep('pricing');
      }
    }
  }, [selectedQuoteId, mode]);

  // Auto-generate invoices for new quotes
  useEffect(() => {
    const autoGenerateInvoices = async () => {
      const newQuotes = quotes.filter(q => 
        q.workflow_status === 'pending' || q.workflow_status === 'under_review'
      );
      
      for (const quote of newQuotes) {
        // Call edge function to generate invoice
        await supabase.functions.invoke('generate-invoice-from-quote', {
          body: { quote_request_id: quote.id }
        });
      }
    };

    if (quotes.length > 0) {
      autoGenerateInvoices();
    }
  }, [quotes]);

  const fetchQuotes = async () => {
    try {
      const data = await WorkflowService.fetchQuotes();
      setQuotes(data as Quote[]);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteById = async (quoteId: string) => {
    try {
      const data = await WorkflowService.fetchQuoteById(quoteId);
      if (data) {
        setSelectedQuote(data as Quote);
        await checkExistingInvoice(quoteId);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const checkExistingInvoice = async (quoteId: string) => {
    try {
      const invoiceData = await WorkflowService.checkExistingInvoice(quoteId);
      
      if (invoiceData) {
        setInvoice(invoiceData);
        const items = await WorkflowService.fetchLineItems(invoiceData.id);
        setLineItems(items);
      } else {
        setInvoice(null);
      }
    } catch (error) {
      console.error('Error checking invoice:', error);
      setInvoice(null);
    }
  };

  const refetchInvoice = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
      
      if (error) throw error;
      if (data) setInvoice(data);
    } catch (error) {
      console.error('Error refetching invoice:', error);
    }
  };

  const handleQuoteUpdate = async (updates: Partial<Quote>) => {
    if (!selectedQuote) return;

    try {
      // Only pass the fields that are being updated to Supabase
      const { error } = await supabase
        .from('quote_requests')
        .update(updates as any) // Type assertion needed for partial updates
        .eq('id', selectedQuote.id);
      
      if (error) throw error;
      
      // Update local state
      setSelectedQuote(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Quote Updated",
        description: "Event details have been saved.",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    checkExistingInvoice(quote.id);
    setCurrentStep('pricing'); // Always go directly to pricing (templates are now inline)
  };

  const generateInvoice = async () => {
    if (!selectedQuote) return;

    try {
      setLoading(true);
      const { invoice: newInvoice, lineItems: items, isNew } = await WorkflowService.generateInvoice(selectedQuote);
      
      setInvoice(newInvoice);
      setLineItems(items);
      setCurrentStep('pricing');

      toast({
        title: "Success",
        description: isNew 
          ? `Invoice created with ${items.length} auto-imported line items ready for pricing.`
          : "Existing invoice found and loaded.",
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePricing = async () => {
    if (!invoice || !selectedQuote) return;

    const hasInvalidPrices = managedLineItems.some(item => 
      !item.unit_price || item.unit_price === 0 || !item.total_price || item.total_price === 0
    );

    if (hasInvalidPrices) {
      toast({
        title: "Validation Error",
        description: "All line items must have valid prices greater than zero",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await saveInvoiceChanges(invoice.id, {
        line_items: managedLineItems.map(item => ({
          ...item,
          id: item.id || ''
        }))
        // Totals will be recalculated by InvoiceTotalsRecalculator
      });

      if (success) {
        // Recalculate totals in database (single source of truth)
        await InvoiceTotalsRecalculator.recalculateInvoice(invoice.id);
        
        // Refetch invoice to get updated totals from database
        await refetchInvoice(invoice.id);
        
        toast({
          title: "Success",
          description: "Pricing validated and saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing",
        variant: "destructive"
      });
    }
  };

  const handleSendEstimate = async () => {
    if (!invoice || !selectedQuote) return;

    try {
      // Recalculate totals before sending to customer
      await InvoiceTotalsRecalculator.recalculateBeforeSend(invoice.id);
      
      // Update invoice with contract requirement and T&C settings
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          requires_separate_contract: requiresContract,
          include_terms_and_conditions: true
        })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      // Sync statuses before advancing
      await syncQuoteWithInvoice(selectedQuote.id);
      
      // Show email preview modal instead of sending directly
      setShowEmailPreview(true);
    } catch (error) {
      console.error('Error preparing estimate:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to prepare estimate",
        variant: "destructive"
      });
    }
  };

  // Template selection removed - now inline in PricingPanel

  if (loading && !selectedQuote) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      {currentStep !== 'select' && selectedQuote && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => {
              setCurrentStep('select');
              setSelectedQuote(null);
              setInvoice(null);
            }}
            className="hover:text-foreground transition-colors"
          >
            All Quotes
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">{selectedQuote.event_name}</span>
          <span>/</span>
          <span className="text-foreground capitalize">{currentStep.replace('_', ' ')}</span>
        </div>
      )}

      <WorkflowSteps 
        currentStep={currentStep} 
        isGovernmentContract={isGovernmentContract}
        requiresContract={requiresContract}
      />

      {currentStep === 'select' && (
        <QuoteSelectionPanel 
          quotes={quotes}
          loading={loading}
          onSelectQuote={handleSelectQuote}
        />
      )}

      {/* Template selection removed - now inline in PricingPanel */}

      {currentStep === 'pricing' && selectedQuote && (
        <PricingPanel
          quote={selectedQuote}
          invoice={invoice}
          lineItems={managedLineItems.map(item => ({ ...item, id: item.id || '' }))}
          totals={totals}
          isModified={isModified}
          isGovernmentContract={isGovernmentContract}
          loading={loading}
          requiresContract={requiresContract}
          onRequiresContractChange={setRequiresContract}
          onGenerateInvoice={generateInvoice}
          onSavePricing={savePricing}
          onSendEstimate={handleSendEstimate}
          onBack={() => setCurrentStep('select')}
          onGovernmentToggle={() => setIsGovernmentContract(!isGovernmentContract)}
          onChangeProcessed={() => checkExistingInvoice(selectedQuote.id)}
          updateLineItem={updateLineItem}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          addTemplateItem={addTemplateItem}
          triggerAutoSave={triggerAutoSave}
          quickCalculatePerPerson={() => quickCalculatePerPerson(selectedQuote.guest_count)}
          onQuoteUpdate={handleQuoteUpdate}
        />
      )}

      {currentStep === 'contract' && selectedQuote && invoice && (
        <TermsAndConditionsPanel
          quote={selectedQuote}
          invoice={invoice}
          onBack={() => setCurrentStep('pricing')}
          onContinue={() => setCurrentStep('payment')}
        />
      )}

      {currentStep === 'payment' && selectedQuote && invoice && (
        <PaymentCollectionPanel
          quote={selectedQuote}
          invoice={invoice}
          isGovernmentContract={isGovernmentContract}
          onBack={() => setCurrentStep('contract')}
          onContinue={() => setCurrentStep('confirmed')}
        />
      )}

      {currentStep === 'confirmed' && selectedQuote && invoice && (
        <EventConfirmationPanel
          quote={selectedQuote}
          invoice={invoice}
          onBack={() => setCurrentStep('payment')}
          onContinue={() => setCurrentStep('completed')}
        />
      )}

      {currentStep === 'completed' && selectedQuote && invoice && (
        <EventCompletionPanel
          quote={selectedQuote}
          invoice={invoice}
          onBack={() => setCurrentStep('confirmed')}
          onComplete={() => {
            toast({
              title: 'Workflow Complete',
              description: 'Event has been completed successfully!'
            });
            setCurrentStep('select');
            fetchQuotes();
          }}
        />
      )}

      {showEmailPreview && selectedQuote && invoice && (
        <EmailPreviewModal
          open={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          quote={selectedQuote}
          invoice={invoice}
          emailType="estimate"
          onSent={() => {
            setCurrentStep('contract');
            setShowEmailPreview(false);
          }}
        />
      )}
    </div>
  );
}
