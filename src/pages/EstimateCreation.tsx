import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateNextSteps } from '@/components/admin/EstimateNextSteps';
import { EmailPreviewModal } from '@/components/admin/EmailPreviewModal';
import { 
  formatCustomerName, 
  formatCustomerPhone, 
  generateProfessionalLineItems,
  type LineItem,
  type QuoteRequest 
} from '@/utils/invoiceFormatters';
import PaymentScheduleDisplay from "@/components/admin/PaymentScheduleDisplay";
import { buildPaymentSchedule, detectCustomerType, calculatePaymentAmounts } from "@/utils/paymentScheduling";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { EstimateActionBar } from '@/components/admin/EstimateActionBar';
import { EstimateLineItems } from '@/components/admin/EstimateLineItems';

// Interfaces imported from utilities

interface InvoiceEstimate {
  quote_request_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_details: {
    name: string;
    event_type: string;
    date: string;
    location: string;
    guest_count: number;
    service_type: string;
  };
  line_items: LineItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  deposit_required: number;
  is_government_contract: boolean;
  notes?: string;
}

interface EstimateCreationProps {
  isEmbedded?: boolean;
}

export default function EstimateCreation({ isEmbedded = false }: EstimateCreationProps) {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [estimate, setEstimate] = useState<InvoiceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('draft');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [existingInvoiceData, setExistingInvoiceData] = useState<any>(null);

  // Generate payment schedule for display - MUST be before any early returns
  const paymentMilestones = React.useMemo(() => {
    if (!quote || !estimate) return [];
    
    try {
      // Prioritize manual government toggle over email detection
      const emailBasedType = detectCustomerType(quote.email);
      const customerType = isGovernmentContract ? 'GOV' : emailBasedType;
      const eventDate = new Date(quote.event_date);
      const approvalDate = new Date();
      
      const schedule = buildPaymentSchedule(
        eventDate,
        customerType,
        approvalDate,
        estimate?.total_amount || 0
      );
      
      const amounts = calculatePaymentAmounts(schedule);
      
      return amounts.map((amount, index) => ({
        id: `milestone_${index}`,
        milestone_type: amount.rule.type,
        percentage: amount.rule.percentage,
        amount_cents: amount.amount_cents,
        due_date: amount.due_date === 'NOW' ? new Date().toISOString() : 
                  amount.due_date === 'NET_30_AFTER_EVENT' ? '' :
                  (amount.due_date as Date).toISOString(),
        is_due_now: amount.due_date === 'NOW',
        is_net30: amount.due_date === 'NET_30_AFTER_EVENT',
        description: amount.rule.description,
        status: 'pending'
      }));
    } catch (error) {
      console.error('Error generating payment schedule:', error);
      return [];
    }
  }, [quote, estimate?.total_amount, isGovernmentContract]);

  useEffect(() => {
    if (quoteId) {
      checkExistingInvoiceAndFetch();
    }
  }, [quoteId]);

  // Debounced auto-save functionality
  useEffect(() => {
    if (!estimate || !hasUnsavedChanges || isAutoSaving || isSaving || isUserEditing) return;
    
    // Clear existing debounce timer
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }
    
    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await handleSaveEstimate();
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
        console.log('Auto-saved estimate');
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: "Auto-save failed",
          description: "Please save manually to ensure your changes are preserved",
          variant: "destructive",
        });
      } finally {
        setIsAutoSaving(false);
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    setSaveDebounceTimer(autoSaveTimer);
    return () => clearTimeout(autoSaveTimer);
  }, [estimate, hasUnsavedChanges, isAutoSaving, isSaving, isUserEditing]);

  useEffect(() => {
    if (!estimate || !invoiceId) return;
    setHasUnsavedChanges(false);
  }, [invoiceId]);

  const checkExistingInvoiceAndFetch = async () => {
    try {
      // First check if an invoice already exists for this quote
      const { data: existingInvoice, error: invoiceCheckError } = await supabase
        .from('invoices')
        .select('id, status, subtotal, tax_amount, total_amount, notes, manual_overrides')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (invoiceCheckError) throw invoiceCheckError;

      if (existingInvoice) {
        console.log('Found existing invoice:', existingInvoice.id, 'with status:', existingInvoice.status);
        // Invoice exists, set the ID and load its data
        setInvoiceId(existingInvoice.id);
        setCurrentStatus(existingInvoice.status);
        
        // Load invoice line items to populate estimate
        await loadExistingInvoiceData(existingInvoice);
      }

      // Always proceed to fetch quote data and show estimate creation
      await fetchQuoteData();
    } catch (error) {
      console.error('Error checking existing invoice:', error);
      toast({
        title: "Error", 
        description: "Failed to load quote data",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loadExistingInvoiceData = async (invoice: any) => {
    try {
      // Load existing line items from invoice
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at', { ascending: true });

      if (lineItemsError) throw lineItemsError;

      console.log('Loaded', lineItems?.length || 0, 'line items from existing invoice');
      
      // Store the existing invoice data to be used when estimate state is set
      setExistingInvoiceData({
        ...invoice,
        line_items: lineItems || []
      });
    } catch (error) {
      console.error('Error loading existing invoice data:', error);
    }
  };

  const fetchQuoteData = async () => {
    try {
      const { data: quoteData, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      // Convert Json arrays to string arrays for our interface
      const processedQuote = {
        ...quoteData,
        appetizers: Array.isArray(quoteData.appetizers) ? quoteData.appetizers : [],
        sides: Array.isArray(quoteData.sides) ? quoteData.sides : [],
        desserts: Array.isArray(quoteData.desserts) ? quoteData.desserts : [],
        drinks: Array.isArray(quoteData.drinks) ? quoteData.drinks : []
      };
      
      setQuote(processedQuote);
      
      // Check if government contract based on email domain
      const isGovEmail = checkGovernmentEmail(quoteData.email);
      setIsGovernmentContract(isGovEmail);
      
      // Initialize estimate with quote data
      initializeEstimate(processedQuote, isGovEmail);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkGovernmentEmail = (email: string): boolean => {
    const govDomains = [
      '.gov', '.mil', '.state.', '.fed.', '.army.', '.navy.', '.air-force.',
      'government.', 'county.', 'city.', 'police.', 'sheriff.', 'fire.'
    ];
    return govDomains.some(domain => email.toLowerCase().includes(domain));
  };

  const initializeEstimate = (quoteData: QuoteRequest, isGov: boolean) => {
    // Check if we have existing invoice data to restore
    if (existingInvoiceData && existingInvoiceData.line_items.length > 0) {
      console.log('Initializing estimate with existing invoice data');
      
      // Use existing invoice data instead of generating new
      const lineItems = existingInvoiceData.line_items.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0,
        category: item.category || 'other'
      }));

      setEstimate({
        quote_request_id: quoteData.id,
        customer_name: formatCustomerName(quoteData.contact_name),
        customer_email: quoteData.email,
        customer_phone: formatCustomerPhone(quoteData.phone),
        event_details: {
          name: quoteData.event_name,
          event_type: quoteData.event_type,
          date: quoteData.event_date,
          location: quoteData.location,
          guest_count: quoteData.guest_count,
          service_type: quoteData.service_type
        },
        line_items: lineItems,
        subtotal: existingInvoiceData.subtotal || 0,
        tax_amount: existingInvoiceData.tax_amount || 0,
        total_amount: existingInvoiceData.total_amount || 0,
        deposit_required: existingInvoiceData.manual_overrides?.deposit_required || (isGov ? 0 : Math.round((existingInvoiceData.total_amount || 0) * 0.25)),
        is_government_contract: existingInvoiceData.manual_overrides?.is_government_contract || isGov,
        notes: existingInvoiceData.notes || quoteData.special_requests
      });
      
      console.log('Estimate initialized with existing data:', lineItems.length, 'line items');
    } else {
      // Generate professional line items with intelligent grouping
      const lineItems = generateProfessionalLineItems(quoteData);

      const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const tax_amount = Math.round(subtotal * 0.08); // 8% tax
      const total_amount = subtotal + tax_amount;
      const deposit_required = isGov ? 0 : Math.round(total_amount * 0.25); // 25% deposit for non-gov

      setEstimate({
        quote_request_id: quoteData.id,
        customer_name: formatCustomerName(quoteData.contact_name),
        customer_email: quoteData.email,
        customer_phone: formatCustomerPhone(quoteData.phone),
        event_details: {
          name: quoteData.event_name,
          event_type: quoteData.event_type,
          date: quoteData.event_date,
          location: quoteData.location,
          guest_count: quoteData.guest_count,
          service_type: quoteData.service_type
        },
        line_items: lineItems,
        subtotal,
        tax_amount,
        total_amount,
        deposit_required,
        is_government_contract: isGov,
        notes: quoteData.special_requests
      });
      
      console.log('Estimate initialized with generated line items:', lineItems.length, 'items');
    }
    
    setHasUnsavedChanges(!!invoiceId); // Only mark as unsaved if no existing invoice
  };


  const handleGovernmentToggle = (checked: boolean) => {
    setIsGovernmentContract(checked);
    if (estimate) {
      const deposit_required = checked ? 0 : Math.round(estimate.total_amount * 0.25);
      setEstimate({
        ...estimate,
        is_government_contract: checked,
        deposit_required
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleManualSave = async () => {
    if (!estimate) return;
    
    setIsSaving(true);
    try {
      await handleSaveEstimate();
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      toast({
        title: "Saved successfully",
        description: "All changes have been saved",
      });
    } catch (error) {
      console.error('Manual save failed:', error);
      toast({
        title: "Save failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEstimateChange = (updatedEstimate: any) => {
    setEstimate(updatedEstimate);
    setHasUnsavedChanges(true);
  };

  const handleSaveEstimate = async () => {
    if (!estimate) return;

    // If we already have an invoice ID, check for changes and create new version if needed
    if (invoiceId) {
      return await handleUpdateEstimate();
    }

    setIsSaving(true);
    try {
      // Create customer if doesn't exist
      let customerId: string;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', estimate.customer_email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: estimate.customer_name,
            email: estimate.customer_email,
            phone: estimate.customer_phone,
            quote_request_id: estimate.quote_request_id
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
        setCustomerId(customerId);
      }

      // Create final estimate
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          customer_id: customerId,
          quote_request_id: estimate.quote_request_id,
          invoice_number: `EST-${Date.now()}`,
          status: 'draft',
          is_draft: true,
          subtotal: estimate.subtotal,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: estimate.notes,
          manual_overrides: {
            is_government_contract: estimate.is_government_contract,
            deposit_required: estimate.deposit_required
          }
        })
        .select('id')
        .single();

        if (invoiceError) throw invoiceError;
        setInvoiceId(invoiceData.id);

      // Create line items
      const lineItemsToInsert = estimate.line_items.map(item => ({
        invoice_id: invoiceData.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsToInsert);

      if (lineItemsError) throw lineItemsError;

      // Update quote status to show estimate in progress
      await supabase
        .from('quote_requests')
        .update({ 
          status: 'pending', // Keep as pending since estimate is just a draft
          estimated_total: estimate.total_amount,
          workflow_status: 'estimated'
        })
        .eq('id', estimate.quote_request_id);

      toast({
        title: "Success",
        description: "Estimate saved successfully",
      });

      setShowNextSteps(true);
      setCurrentStatus('draft');
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      return invoiceData.id;
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast({
        title: "Error",
        description: "Failed to save estimate",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEstimate = async () => {
    if (!estimate || !invoiceId) return;

    setIsSaving(true);
    try {
      // Check current invoice status
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('status, workflow_status')
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      // If estimate was already sent, create a new version
      if (currentInvoice.status !== 'draft') {
        // Create estimate version for audit trail
        await supabase.from('estimate_versions').insert({
          invoice_id: invoiceId,
          version_number: Date.now(), // Simple versioning
          line_items: estimate.line_items as any,
          subtotal: estimate.subtotal,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          notes: estimate.notes,
          status: 'draft'
        });

        // Reset invoice to draft status for re-approval BUT preserve totals and line items
        await supabase
          .from('invoices')
          .update({ 
            status: 'draft',
            is_draft: true,
            workflow_status: 'draft',
            // Preserve the updated totals
            subtotal: estimate.subtotal,
            tax_amount: estimate.tax_amount,
            total_amount: estimate.total_amount,
            notes: estimate.notes
          })
          .eq('id', invoiceId);

        setCurrentStatus('draft');
        
        toast({
          title: "Estimate Updated",
          description: "Changes saved. Estimate requires customer re-approval.",
          duration: 5000
        });
      }

      // Update existing invoice with new data
      await supabase
        .from('invoices')
        .update({
          subtotal: estimate.subtotal,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          notes: estimate.notes,
          manual_overrides: {
            is_government_contract: estimate.is_government_contract,
            deposit_required: estimate.deposit_required
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      // Delete and recreate line items
      await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      const lineItemsToInsert = estimate.line_items.map(item => ({
        invoice_id: invoiceId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category
      }));

      await supabase
        .from('invoice_line_items')
        .insert(lineItemsToInsert);

      // Update quote with new estimated total
      await supabase
        .from('quote_requests')
        .update({ 
          estimated_total: estimate.total_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', estimate.quote_request_id);

      toast({
        title: "Success",
        description: "Estimate updated successfully",
      });

      setShowNextSteps(true);
      setHasUnsavedChanges(false);
      return invoiceId;
    } catch (error) {
      console.error('Error updating estimate:', error);
      toast({
        title: "Error",
        description: "Failed to update estimate",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };



  const handleGeneratePreview = async () => {
    if (!estimate) {
      console.error('No estimate data available');
      toast({
        title: "Error",
        description: "No estimate data available for preview",
        variant: "destructive"
      });
      return;
    }

    try {
      // First save the estimate if not already saved
      let previewInvoiceId = invoiceId;
      if (!previewInvoiceId) {
        console.log('No invoice ID, saving estimate first...');
        previewInvoiceId = await handleSaveEstimate();
      }

      if (!previewInvoiceId) {
        throw new Error('Failed to save estimate for preview');
      }

      console.log('Opening preview for invoice:', previewInvoiceId);
      // Open preview using the saved invoice ID
      const previewUrl = `/admin/estimate-preview/${previewInvoiceId}`;
      window.open(previewUrl, '_blank');
      
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: `Failed to generate preview: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleSendEstimate = async () => {
    try {
      // First save the estimate if not already saved
      let savedInvoiceId = invoiceId;
      if (!savedInvoiceId) {
        savedInvoiceId = await handleSaveEstimate();
      }
      
      if (!savedInvoiceId) {
        throw new Error('Failed to save estimate');
      }

      // Send the estimate directly using edge function
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: { invoice_id: savedInvoiceId }
      });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          is_draft: false,
          sent_at: new Date().toISOString()
        })
        .eq('id', savedInvoiceId);

      toast({
        title: "Success",
        description: "Estimate sent to customer successfully",
      });

      // Refresh the page to show updated status
      window.location.reload();
      
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Error",
        description: "Failed to send estimate",
        variant: "destructive"
      });
    }
  };

  const handleScheduleFollow = () => {
    // Schedule follow-up reminders
    toast({
      title: "Follow-up Scheduled",
      description: "Reminder set for 3 days from now",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading quote data...</p>
        </div>
      </div>
    );
  }

  if (!quote || !estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-foreground">Quote not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className={isEmbedded ? "bg-background" : "min-h-screen bg-background"}>
      {/* Fixed Header - Only show when not embedded */}
      {!isEmbedded && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <div>
                    <h1 className="text-xl font-semibold">
                      Estimate Creation
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {quote.event_name} - {new Date(quote.event_date).toLocaleDateString()}
                    </p>
                     <p className="text-xs text-muted-foreground">
                        {isAutoSaving ? (
                          'Auto-saving...'
                        ) : hasUnsavedChanges ? (
                          'Unsaved changes'
                        ) : lastSavedAt ? (
                          `Last saved: ${lastSavedAt.toLocaleTimeString()}`
                        ) : (
                          'Ready to save'
                        )}
                      </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="flex items-center gap-2"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <EstimateActionBar
                  context="creation"
                  hasUnsavedChanges={hasUnsavedChanges}
                  isAutoSaving={isAutoSaving}
                  isSaving={isSaving}
                  invoiceId={invoiceId}
                  onBack={() => navigate('/admin')}
                  onPreview={handleGeneratePreview}
                  onSave={handleSaveEstimate}
                  onSend={() => setShowEmailPreview(true)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={isEmbedded ? "px-0 py-0" : "container mx-auto px-4 sm:px-6 py-6 sm:py-8"}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Estimate Details - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer & Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Customer</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{estimate.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.customer_email}</span>
                        {isGovernmentContract && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Government
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.customer_phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Event</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.event_details.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(estimate.event_details.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.event_details.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{estimate.event_details.guest_count} guests</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Consolidated Line Items & Pricing */}
            <EstimateLineItems
              estimate={estimate}
              isGovernmentContract={isGovernmentContract}
              onEstimateChange={handleEstimateChange}
              onGovernmentToggle={handleGovernmentToggle}
              onUserEditingChange={setIsUserEditing}
              invoiceId={invoiceId}
            />

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes & Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={estimate.notes || ''}
                  onChange={(e) => {
                    setEstimate({ ...estimate, notes: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Add any special notes or requests for this estimate..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Estimate Summary - Sidebar */}
          <div className="space-y-6">
            {/* Next Steps Section */}
            {showNextSteps && invoiceId && (
              <EstimateNextSteps
                invoiceId={invoiceId}
                status={currentStatus}
                customerEmail={estimate.customer_email}
                totalAmount={estimate.total_amount}
                onStatusChange={() => {
                  // Refresh or update status as needed
                  setCurrentStatus('sent');
                }}
              />
            )}

            {/* Payment Schedule Section */}
            <PaymentScheduleDisplay
              milestones={paymentMilestones}
              customerType={quote ? detectCustomerType(quote.email) : 'PERSON'}
              totalAmount={estimate?.total_amount || 0}
              eventDate={quote?.event_date}
            />

            {/* Estimate Summary */}
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Estimate Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Tax (8%)</span>
                    <span className="font-medium">{formatCurrency(estimate.tax_amount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(estimate.total_amount)}</span>
                  </div>
                  
                  {!isGovernmentContract && (
                    <>
                      <Separator />
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                            Required Deposit (25%)
                          </span>
                          <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                            {formatCurrency(estimate.deposit_required)}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Due upon approval
                        </p>
                      </div>
                    </>
                  )}
                  
                  {isGovernmentContract && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Government Contract</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        No deposit required - Net 30 payment terms
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation Warning */}
                {estimate.line_items.some(item => item.unit_price === 0) && (
                  <div className="bg-destructive/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Pricing Required</span>
                    </div>
                    <p className="text-xs text-destructive/80 mt-1">
                      Please set prices for all items before creating the estimate
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Preview Modal */}
        {showEmailPreview && invoiceId && estimate && (
          <EmailPreviewModal
            isOpen={showEmailPreview}
            onClose={() => setShowEmailPreview(false)}
            estimateData={{
              id: invoiceId,
              customers: {
                name: estimate.customer_name,
                email: estimate.customer_email
              },
              quote_requests: {
                event_name: estimate.event_details.name,
                event_date: estimate.event_details.date,
                location: estimate.event_details.location,
                guest_count: estimate.event_details.guest_count
              },
              total_amount: estimate.total_amount,
              subtotal: estimate.subtotal,
              tax_amount: estimate.tax_amount,
              notes: estimate.notes,
              is_government_contract: estimate.is_government_contract
            } as any}
            lineItems={estimate.line_items}
            onEmailSent={() => {
              setShowEmailPreview(false);
              setShowNextSteps(true);
              setCurrentStatus('sent');
              toast({
                title: "Estimate Sent",
                description: "Estimate has been sent to customer successfully",
              });
            }}
          />
        )}

      </div>
    </div>
  );
}