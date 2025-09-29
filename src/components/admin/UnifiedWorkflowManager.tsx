import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEstimateLineItems } from './EnhancedEstimateLineItems';
import { useEnhancedPricingManagement } from '@/hooks/useEnhancedPricingManagement';
import { useInvoiceEditing } from '@/hooks/useInvoiceEditing';
import { UnifiedEmailReviewModal } from './UnifiedEmailReviewModal';
import { format } from 'date-fns';
import { 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  FileEdit, 
  Send, 
  Check,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Quote {
  id: string;
  contact_name: string;
  email: string;
  event_name: string;
  event_date: string;
  guest_count: number;
  location: string;
  status: string;
  workflow_status: string;
  created_at: string;
}

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
  const [currentStep, setCurrentStep] = useState<'select' | 'pricing' | 'review' | 'send'>('select');
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { toast } = useToast();

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

  const { saveInvoiceChanges, isEditMode, toggleEditMode } = useInvoiceEditing();

  // Calculate totals from line items
  const totals = useMemo(() => {
    const subtotal = managedLineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax_amount = Math.round(subtotal * 0.095); // 9.5% tax
    const total_amount = subtotal + tax_amount;
    
    return { subtotal, tax_amount, total_amount };
  }, [managedLineItems]);

  // Load quotes on mount and handle selectedQuoteId
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
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .in('status', ['pending', 'reviewed', 'quoted', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
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
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedQuote(data);
        await checkExistingInvoice(quoteId);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const checkExistingInvoice = async (quoteId: string) => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (invoiceError) throw invoiceError;

      if (invoiceData) {
        setInvoice(invoiceData);
        await fetchLineItems(invoiceData.id);
      }
    } catch (error) {
      console.error('Error checking invoice:', error);
    }
  };

  const fetchLineItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
    }
  };

  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    checkExistingInvoice(quote.id);
    setCurrentStep('pricing');
  };

  const generateInvoice = async () => {
    if (!selectedQuote) return;

    try {
      setLoading(true);

      // Create invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: selectedQuote.id,
          status: 'draft',
          document_type: 'estimate',
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          is_draft: true
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      setInvoice(newInvoice);
      setCurrentStep('pricing');

      toast({
        title: "Success",
        description: "Invoice created. Ready for pricing.",
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
          description: "Pricing saved successfully",
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

  const handleSendEstimate = () => {
    setShowEmailModal(true);
  };

  const getStepStatus = (step: string) => {
    const stepOrder = ['select', 'pricing', 'review', 'send'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
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
      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Unified Workflow Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            {[
              { step: 'select', label: 'Select Quote', icon: FileEdit },
              { step: 'pricing', label: 'Price & Review', icon: DollarSign },
              { step: 'review', label: 'Final Review', icon: Check },
              { step: 'send', label: 'Send Estimate', icon: Send }
            ].map(({ step, label, icon: Icon }, index) => {
              const status = getStepStatus(step);
              return (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    status === 'current' ? 'bg-primary text-primary-foreground' :
                    status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-background text-muted-foreground'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {index < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Quote to Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectQuote(quote)}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{quote.event_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {quote.contact_name} • {format(new Date(quote.event_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {quote.guest_count} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {quote.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{quote.status}</Badge>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Step */}
      {currentStep === 'pricing' && selectedQuote && (
        <div className="space-y-6">
          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pricing for {selectedQuote.event_name}</span>
                <Badge variant="outline">{selectedQuote.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Contact</div>
                  <div className="text-muted-foreground">{selectedQuote.contact_name}</div>
                </div>
                <div>
                  <div className="font-medium">Event Date</div>
                  <div className="text-muted-foreground">
                    {format(new Date(selectedQuote.event_date), 'PPP')}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Guest Count</div>
                  <div className="text-muted-foreground">{selectedQuote.guest_count} guests</div>
                </div>
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-muted-foreground">{selectedQuote.location}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Management */}
          {!invoice ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground">No invoice exists for this quote.</div>
                  <Button onClick={generateInvoice} disabled={loading}>
                    Generate Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EnhancedEstimateLineItems
              lineItems={managedLineItems.map(item => ({
                ...item,
                id: item.id || ''
              }))}
              updateLineItem={updateLineItem}
              addLineItem={addLineItem}
              removeLineItem={removeLineItem}
              addTemplateItem={addTemplateItem}
              subtotal={totals.subtotal}
              taxAmount={totals.tax_amount}
              grandTotal={totals.total_amount}
              guestCount={selectedQuote.guest_count}
              isModified={isModified}
              triggerAutoSave={triggerAutoSave}
              quickCalculatePerPerson={() => quickCalculatePerPerson(selectedQuote.guest_count)}
              isGovernmentContract={false}
              onGovernmentToggle={() => {}}
            />
          )}

          {invoice && (
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep('select')} 
                variant="outline"
              >
                Back to Quotes
              </Button>
              <Button 
                onClick={savePricing} 
                disabled={!managedLineItems.length || totals.total_amount === 0}
              >
                Save & Continue to Review
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && selectedQuote && invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Final Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Quote Details</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Event:</strong> {selectedQuote.event_name}</div>
                  <div><strong>Contact:</strong> {selectedQuote.contact_name}</div>
                  <div><strong>Email:</strong> {selectedQuote.email}</div>
                  <div><strong>Date:</strong> {format(new Date(selectedQuote.event_date), 'PPP')}</div>
                  <div><strong>Guests:</strong> {selectedQuote.guest_count}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pricing Summary</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Items:</strong> {managedLineItems.length}</div>
                  <div><strong>Subtotal:</strong> ${(totals.subtotal / 100).toFixed(2)}</div>
                  <div><strong>Tax:</strong> ${(totals.tax_amount / 100).toFixed(2)}</div>
                  <div><strong>Total:</strong> ${(totals.total_amount / 100).toFixed(2)}</div>
                  <div><strong>Per Guest:</strong> ${(totals.total_amount / selectedQuote.guest_count / 100).toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep('pricing')} 
                variant="outline"
              >
                Back to Pricing
              </Button>
              <Button onClick={handleSendEstimate}>
                Send Estimate to Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Modal */}
      {showEmailModal && invoice && selectedQuote && (
        <UnifiedEmailReviewModal
          invoice={{
            ...invoice,
            quote_request: selectedQuote
          }}
          emailType="estimate"
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onEmailSent={() => {
            setShowEmailModal(false);
            setCurrentStep('send');
            toast({
              title: "Success",
              description: "Estimate sent successfully!",
            });
          }}
        />
      )}
    </div>
  );
}