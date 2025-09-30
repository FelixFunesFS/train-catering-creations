import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateProfessionalLineItems, type QuoteRequest } from '@/utils/invoiceFormatters';
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

// Use QuoteRequest type from invoiceFormatters which matches the database structure
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
  const [currentStep, setCurrentStep] = useState<'select' | 'pricing' | 'review' | 'send'>('select');
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
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
    console.log('🔍 DEBUG: useEffect called, selectedQuoteId:', selectedQuoteId, 'mode:', mode);
    fetchQuotes();
    if (selectedQuoteId) {
      fetchQuoteById(selectedQuoteId);
      if (mode === 'pricing') {
        setCurrentStep('pricing');
      }
    }
  }, [selectedQuoteId, mode]);

  // Debug quotes state changes
  useEffect(() => {
    console.log('🔍 DEBUG: quotes state changed:', quotes.length, 'quotes');
    console.log('🔍 DEBUG: quotes data:', quotes);
  }, [quotes]);

  // Debug loading state changes
  useEffect(() => {
    console.log('🔍 DEBUG: loading state changed:', loading);
  }, [loading]);

  // Debug current step changes
  useEffect(() => {
    console.log('🔍 DEBUG: currentStep changed:', currentStep);
  }, [currentStep]);

  const fetchQuotes = async () => {
    console.log('🔍 DEBUG: fetchQuotes called');
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .in('status', ['pending', 'reviewed', 'quoted', 'confirmed'])
        .order('created_at', { ascending: false });

      console.log('🔍 DEBUG: fetchQuotes response:', { data, error });
      if (error) throw error;
      
      const quotesData = (data as Quote[]) || [];
      console.log('🔍 DEBUG: Setting quotes to:', quotesData);
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      console.log('🔍 DEBUG: Setting loading to false');
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
        setSelectedQuote(data as Quote);
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

      // Auto-generate grouped line items from quote data
      const generatedLineItems = generateProfessionalLineItems(selectedQuote);
      
      // Insert line items into database
      if (generatedLineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(
            generatedLineItems.map(item => ({
              invoice_id: newInvoice.id,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unit_price: 0, // Start with zero pricing for admin to set
              total_price: 0,
              category: item.category
            }))
          );

        if (lineItemsError) throw lineItemsError;
        
        // Fetch the created line items
        await fetchLineItems(newInvoice.id);
      }

      setInvoice(newInvoice);
      setCurrentStep('pricing');

      toast({
        title: "Success",
        description: `Invoice created with ${generatedLineItems.length} auto-imported line items ready for pricing.`,
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
                <div key={step} className="flex items-center gap-2">
                   <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                     status === 'current' ? 'bg-primary text-primary-foreground' :
                     status === 'completed' ? 'bg-muted text-muted-foreground' :
                     'bg-background text-muted-foreground'
                   }`}>
                     <Icon className="h-4 w-4" />
                     <span className="text-sm font-medium">{label}</span>
                   </div>
                   {index < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                 </div>
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
               {(() => {
                 console.log('🔍 DEBUG: Rendering quotes list, count:', quotes.length);
                 return null;
               })()}
               {quotes.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   No quotes available. {loading ? 'Loading...' : 'Please create a quote first.'}
                 </div>
               ) : (
                 quotes.map((quote) => (
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
                 ))
               )}
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
              isGovernmentContract={isGovernmentContract}
              onGovernmentToggle={() => setIsGovernmentContract(!isGovernmentContract)}
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Event Details</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Event:</span>
                      <span className="text-muted-foreground">{selectedQuote.event_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Type:</span>
                      <span className="text-muted-foreground capitalize">{selectedQuote.event_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Date:</span>
                      <span className="text-muted-foreground">{format(new Date(selectedQuote.event_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Time:</span>
                      <span className="text-muted-foreground">{selectedQuote.start_time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Guests:</span>
                      <span className="text-muted-foreground">{selectedQuote.guest_count}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Location:</span>
                      <span className="text-muted-foreground">{selectedQuote.location}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Name:</span>
                      <span className="text-muted-foreground">{selectedQuote.contact_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Email:</span>
                      <span className="text-muted-foreground">{selectedQuote.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Phone:</span>
                      <span className="text-muted-foreground">{selectedQuote.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service & Menu Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Service Details</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[120px]">Service Type:</span>
                      <span className="text-muted-foreground capitalize">{selectedQuote.service_type?.replace('_', ' ')}</span>
                    </div>
                    {(selectedQuote as any).serving_start_time && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[120px]">Serving Time:</span>
                        <span className="text-muted-foreground">{(selectedQuote as any).serving_start_time}</span>
                      </div>
                    )}
                    {selectedQuote.wait_staff_requested && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[120px]">Wait Staff:</span>
                        <Badge variant="secondary">Requested</Badge>
                      </div>
                    )}
                    {isGovernmentContract && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[120px]">Contract Type:</span>
                        <Badge variant="outline">Government Contract</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Menu Selections */}
                {(selectedQuote.primary_protein || selectedQuote.secondary_protein) && (
                  <div>
                    <h4 className="font-semibold mb-3">Menu</h4>
                    <div className="text-sm space-y-2">
                      {selectedQuote.primary_protein && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-[120px]">Primary Protein:</span>
                          <span className="text-muted-foreground">{selectedQuote.primary_protein}</span>
                        </div>
                      )}
                      {selectedQuote.secondary_protein && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-[120px]">Secondary:</span>
                          <span className="text-muted-foreground">{selectedQuote.secondary_protein}</span>
                        </div>
                      )}
                      {selectedQuote.sides && Array.isArray(selectedQuote.sides) && selectedQuote.sides.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-[120px]">Sides:</span>
                          <span className="text-muted-foreground">{selectedQuote.sides.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedQuote.special_requests && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Special Requests</h4>
                      <p className="text-sm text-muted-foreground">{selectedQuote.special_requests}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Pricing Summary */}
            <div>
              <h4 className="font-semibold mb-3">Pricing Summary</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Line Items ({managedLineItems.length})</span>
                  <span className="font-medium">${(totals.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (9.5%)</span>
                  <span className="font-medium">${(totals.tax_amount / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(totals.total_amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Per Guest</span>
                  <span>${(totals.total_amount / selectedQuote.guest_count / 100).toFixed(2)}</span>
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
          lineItems={managedLineItems}
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