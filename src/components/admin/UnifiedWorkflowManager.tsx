import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type QuoteRequest } from '@/utils/invoiceFormatters';
import { useEnhancedPricingManagement } from '@/hooks/useEnhancedPricingManagement';
import { useInvoiceEditing } from '@/hooks/useInvoiceEditing';
import { useWorkflowSync } from '@/hooks/useWorkflowSync';
import { UnifiedEmailReviewModal } from './UnifiedEmailReviewModal';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowSteps } from './workflow/WorkflowSteps';
import { QuoteSelectionPanel } from './workflow/QuoteSelectionPanel';
import { PricingPanel } from './workflow/PricingPanel';
import { ReviewPanel } from './workflow/ReviewPanel';
import { ContractGenerationPanel } from './workflow/ContractGenerationPanel';
import { PaymentCollectionPanel } from './workflow/PaymentCollectionPanel';
import { EventConfirmationPanel } from './workflow/EventConfirmationPanel';
import { EventCompletionPanel } from './workflow/EventCompletionPanel';
import { WeddingTemplateSelector } from './workflow/WeddingTemplateSelector';
import { GovernmentContractPanel } from './workflow/GovernmentContractPanel';
import { TimelineTasksPanel } from './workflow/TimelineTasksPanel';
import { WorkflowService } from '@/services/WorkflowService';

type Quote = QuoteRequest & {
  created_at: string;
};

interface Invoice {
  id: string;
  quote_request_id: string;
  status: string;
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
  const [currentStep, setCurrentStep] = useState<'select' | 'template' | 'pricing' | 'review' | 'contract' | 'payment' | 'confirmed' | 'completed'>('select');
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
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
    calculateTotals,
    isModified,
    triggerAutoSave,
    quickCalculatePerPerson,
    validatePricing
  } = useEnhancedPricingManagement({
    initialLineItems: lineItems,
    guestCount: selectedQuote?.guest_count || 0,
    taxRate: 0.095,
    autoSave: true,
    invoiceId: invoice?.id,
    onTotalsChange: (totalsData) => {
      if (invoice) {
        setInvoice(prev => prev ? {
          ...prev,
          subtotal: totalsData.subtotal,
          tax_amount: totalsData.tax_amount,
          total_amount: totalsData.total_amount
        } : null);
      }
    }
  });

  const { saveInvoiceChanges } = useInvoiceEditing();

  const totals = useMemo(() => {
    const subtotal = managedLineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax_amount = Math.round(subtotal * 0.095);
    const total_amount = subtotal + tax_amount;
    return { subtotal, tax_amount, total_amount };
  }, [managedLineItems]);

  // Load quotes on mount
  useEffect(() => {
    fetchQuotes();
    if (selectedQuoteId) {
      fetchQuoteById(selectedQuoteId);
      if (mode === 'pricing') {
        setCurrentStep('pricing');
      }
    }
  }, [selectedQuoteId, mode]);

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

  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    checkExistingInvoice(quote.id);
    
    // Check if wedding event to show template selector
    if (quote.event_type === 'wedding' || quote.event_type === 'second_wedding') {
      setShowTemplateSelector(true);
      setCurrentStep('template');
    } else {
      setCurrentStep('pricing');
    }
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

    if (!totals.total_amount || totals.total_amount === 0) {
      toast({
        title: "Validation Error",
        description: "Invoice total cannot be zero",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await saveInvoiceChanges(invoice.id, {
        line_items: managedLineItems.map(item => ({
          ...item,
          id: item.id || ''
        })),
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount
      });

      if (success) {
        setCurrentStep('review');
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
      // Update invoice with contract requirement and T&C settings
      const { error } = await supabase
        .from('invoices')
        .update({
          requires_separate_contract: requiresContract,
          include_terms_and_conditions: true
        })
        .eq('id', invoice.id);

      if (error) throw error;

      // Sync statuses before advancing
      await syncQuoteWithInvoice(selectedQuote.id);
      
      // Show email modal
      setShowEmailModal(true);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice settings",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = async (template: any) => {
    setShowTemplateSelector(false);
    
    // Generate invoice if not exists
    if (!invoice) {
      await generateInvoice();
    }

    // Add template items
    const pricePerGuest = template.basePrice * 100; // Convert to cents
    const templateItems = template.items.map((item: any, index: number) => ({
      id: `temp-${index}`,
      title: item.title,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      unit_price: Math.round(pricePerGuest / template.items.length),
      total_price: Math.round((pricePerGuest / template.items.length) * item.quantity)
    }));

    setLineItems(templateItems);
    setCurrentStep('pricing');
    
    toast({
      title: 'Template Applied',
      description: `${template.name} has been applied. You can now customize the pricing.`
    });
  };

  const handleSkipTemplate = () => {
    setShowTemplateSelector(false);
    setCurrentStep('pricing');
  };

  if (loading && !selectedQuote) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowSteps currentStep={currentStep} />

      {currentStep === 'select' && (
        <QuoteSelectionPanel 
          quotes={quotes}
          loading={loading}
          onSelectQuote={handleSelectQuote}
        />
      )}

      {currentStep === 'template' && selectedQuote && showTemplateSelector && (
        <WeddingTemplateSelector
          guestCount={selectedQuote.guest_count}
          onSelectTemplate={handleTemplateSelect}
          onSkip={handleSkipTemplate}
        />
      )}

      {currentStep === 'pricing' && selectedQuote && (
        <PricingPanel
          quote={selectedQuote}
          invoice={invoice}
          lineItems={managedLineItems.map(item => ({ ...item, id: item.id || '' }))}
          totals={totals}
          isModified={isModified}
          isGovernmentContract={isGovernmentContract}
          loading={loading}
          onGenerateInvoice={generateInvoice}
          onSavePricing={savePricing}
          onBack={() => setCurrentStep('select')}
          onGovernmentToggle={() => setIsGovernmentContract(!isGovernmentContract)}
          onChangeProcessed={() => checkExistingInvoice(selectedQuote.id)}
          updateLineItem={updateLineItem}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          addTemplateItem={addTemplateItem}
          triggerAutoSave={triggerAutoSave}
          quickCalculatePerPerson={() => quickCalculatePerPerson(selectedQuote.guest_count)}
        />
      )}

      {currentStep === 'review' && selectedQuote && invoice && (
        <ReviewPanel
          quote={selectedQuote}
          lineItems={managedLineItems}
          totals={totals}
          isGovernmentContract={isGovernmentContract}
          requiresContract={requiresContract}
          onRequiresContractChange={setRequiresContract}
          onBack={() => setCurrentStep('pricing')}
          onSendEstimate={handleSendEstimate}
        />
      )}

      {currentStep === 'contract' && selectedQuote && invoice && (
        <ContractGenerationPanel
          quote={selectedQuote}
          invoice={invoice}
          isGovernmentContract={isGovernmentContract}
          onBack={() => setCurrentStep('review')}
          onContinue={() => setCurrentStep('payment')}
          onSkipContract={() => setCurrentStep('payment')}
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

      {showEmailModal && invoice && selectedQuote && (
        <UnifiedEmailReviewModal
          invoice={invoice}
          quoteRequest={selectedQuote}
          lineItems={managedLineItems}
          emailType="estimate"
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onEmailSent={() => {
            setShowEmailModal(false);
            toast({
              title: "Success",
              description: "Estimate sent successfully!",
            });
            
            // Advance workflow based on contract requirement
            if (requiresContract) {
              setCurrentStep('contract');
            } else {
              setCurrentStep('payment');
            }
          }}
        />
      )}
    </div>
  );
}
