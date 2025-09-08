import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLineItemManagement } from '@/hooks/useLineItemManagement';
import { ConsolidatedPhaseCard } from '@/components/admin/ConsolidatedPhaseCard';
import { EnhancedEstimateLineItems } from '@/components/admin/EnhancedEstimateLineItems';
import { type LineItem as UtilsLineItem, generateProfessionalLineItems, type QuoteRequest } from '@/utils/invoiceFormatters';
import { Eye, Send, DollarSign, CheckCircle2, Clock, RefreshCw, ExternalLink, Calendar, User, Mail, MapPin } from 'lucide-react';

interface StreamlinedEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId?: string;
  invoiceId?: string;
  onSuccess?: () => void;
}

interface EstimateData {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  customer_id: string;
  quote_request_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  location: string;
  line_items: any[];
  payment_milestones: any[];
}

export function StreamlinedEstimateModal({
  isOpen,
  onClose,
  quoteId,
  invoiceId,
  onSuccess
}: StreamlinedEstimateModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [totals, setTotals] = useState({ subtotal: 0, tax_amount: 0, total_amount: 0 });

  const {
    lineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    isModified,
    resetLineItems,
    calculateTotals
  } = useLineItemManagement({
    initialLineItems: estimateData?.line_items || [],
    taxRate: isGovernmentContract ? 0 : 8.5,
    isGovernmentContract,
    autoSave: false,
    onTotalsChange: setTotals
  });

  useEffect(() => {
    if (isOpen) {
      if (invoiceId) {
        fetchEstimate();
      } else if (quoteId) {
        checkOrCreateEstimate();
      }
    }
  }, [isOpen, invoiceId, quoteId]);

  useEffect(() => {
    if (estimateData && lineItems.length === 0 && estimateData.line_items.length > 0) {
      resetLineItems();
    }
  }, [estimateData, resetLineItems]);

  useEffect(() => {
    if (isModified && estimateData) {
      setEstimateData(prev => prev ? { ...prev, total_amount: totals.total_amount } : null);
    }
  }, [totals.total_amount, isModified]);

  const fetchEstimate = async () => {
    if (!invoiceId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          quote_requests!invoices_quote_request_id_fkey(*),
          customers!invoices_customer_id_fkey(*),
          payment_milestones(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setEstimateData({
        id: data.id,
        invoice_number: data.invoice_number,
        status: data.status,
        total_amount: data.total_amount,
        customer_id: data.customer_id,
        quote_request_id: data.quote_request_id,
        event_name: data.quote_requests?.event_name || '',
        event_type: data.quote_requests?.event_type || '',
        event_date: data.quote_requests?.event_date || '',
        guest_count: data.quote_requests?.guest_count || 0,
        location: data.quote_requests?.location || '',
        line_items: (data as any).line_items || [],
        payment_milestones: data.payment_milestones || []
      });

      if (data.quote_requests) {
        setQuote(data.quote_requests);
        setIsGovernmentContract((data.quote_requests as any).requires_po_number || false);
      }
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOrCreateEstimate = async () => {
    if (!quoteId) return;

    setLoading(true);
    try {
      // Check for existing estimate
      const { data: existingEstimate } = await supabase
        .from('invoices')
        .select('id')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (existingEstimate) {
        // Load existing estimate
        setLoading(false);
        return fetchEstimate();
      }

      // Enter creation mode
      setIsCreationMode(true);
      await loadQuoteForCreation();
    } catch (error) {
      console.error('Error checking estimate:', error);
      toast({
        title: "Error", 
        description: "Failed to check estimate status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadQuoteForCreation = async () => {
    if (!quoteId) return;

    try {
      const { data: quoteData, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      setQuote(quoteData);
      setIsGovernmentContract(quoteData.requires_po_number || false);
      
      // Generate line items from quote data
      const generatedLineItems = generateProfessionalLineItems(quoteData as QuoteRequest);
      
      // Initialize estimate data for creation
      setEstimateData({
        id: '',
        invoice_number: '',
        status: 'draft',
        total_amount: 0,
        customer_id: '',
        quote_request_id: quoteId,
        event_name: quoteData.event_name,
        event_type: quoteData.event_type,
        event_date: quoteData.event_date,
        guest_count: quoteData.guest_count,
        location: quoteData.location,
        line_items: generatedLineItems,
        payment_milestones: []
      });
    } catch (error) {
      console.error('Error loading quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote data",
        variant: "destructive"
      });
    }
  };

  const handleSendEstimate = async () => {
    if (!estimateData?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: estimateData.id,
          custom_subject: `Your Estimate - ${estimateData.event_name}`,
          custom_message: `Dear Customer,\n\nThank you for considering Soul Train's Eatery for your upcoming ${estimateData.event_name}. Please review the attached estimate.\n\nBest regards,\nSoul Train's Eatery Team`
        }
      });

      if (error) throw error;

      toast({
        title: "Estimate sent!",
        description: "The estimate has been emailed to the customer",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Failed to send estimate",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!estimateData?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: estimateData.id,
          amount: estimateData.total_amount,
          customer_email: quote?.email,
          description: `Payment for ${estimateData.event_name}`
        }
      });

      if (error) throw error;

      await navigator.clipboard.writeText(data.url);
      
      toast({
        title: "Payment link created!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Failed to create payment link",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateFromQuote = async () => {
    if (!quote) {
      toast({
        title: "Error",
        description: "No quote data available to regenerate from",
        variant: "destructive"
      });
      return;
    }

    try {
      const generatedLineItems = generateProfessionalLineItems(quote as QuoteRequest);
      
      setEstimateData(prev => prev ? {
        ...prev,
        line_items: generatedLineItems
      } : null);
      
      toast({
        title: "Line Items Regenerated",
        description: "Line items have been regenerated from the original quote data",
      });
    } catch (error) {
      console.error('Error regenerating line items:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate line items from quote",
        variant: "destructive"
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (invoiceId) {
      window.open(`/admin?tab=estimates-progress&invoiceId=${invoiceId}&modal=estimate`, '_blank');
    } else if (quoteId) {
      window.open(`/admin?tab=new-requests&quoteId=${quoteId}&action=create-estimate`, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary' as const, label: 'Draft', icon: Clock };
      case 'sent':
        return { variant: 'default' as const, label: 'Sent', icon: Send };
      case 'viewed':
        return { variant: 'default' as const, label: 'Viewed', icon: Eye };
      case 'approved':
        return { variant: 'default' as const, label: 'Approved', icon: CheckCircle2 };
      case 'paid':
        return { variant: 'default' as const, label: 'Paid', icon: DollarSign };
      default:
        return { variant: 'secondary' as const, label: status, icon: Clock };
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading estimate...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!estimateData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Estimate not found</p>
              <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusBadge = getStatusBadge(estimateData.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {isCreationMode ? 'Create Estimate' : 'Estimate Management'}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <h2 className="text-lg text-muted-foreground">{estimateData.event_name}</h2>
                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusBadge.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              {estimateData.id && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/estimate-preview/${estimateData.id}`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSendEstimate}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCreatePaymentLink}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Payment Link
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Line Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer & Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Event Name</label>
                        <p className="font-medium">{estimateData.event_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                        <p className="font-medium">{estimateData.event_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(estimateData.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{estimateData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{estimateData.guest_count} guests</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${(totals.subtotal / 100).toFixed(2)}</span>
                    </div>
                    {!isGovernmentContract && (
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>${(totals.tax_amount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${(totals.total_amount / 100).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                {quote && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Quote-Based Actions</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerateFromQuote}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate from Quote
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Generate line items automatically from the original quote request data including menu selections, guest count, and service options.
                      </p>
                    </CardContent>
                  </Card>
                )}
                {estimateData && (
                  <EnhancedEstimateLineItems
                    lineItems={lineItems as UtilsLineItem[]}
                    subtotal={totals.subtotal}
                    taxAmount={totals.tax_amount}
                    grandTotal={totals.total_amount}
                    updateLineItem={updateLineItem}
                    addLineItem={addLineItem}
                    removeLineItem={removeLineItem}
                    addTemplateItem={() => {}}
                    quickCalculatePerPerson={() => {}}
                    isGovernmentContract={isGovernmentContract}
                    onGovernmentToggle={(checked) => setIsGovernmentContract(checked)}
                    guestCount={estimateData.guest_count}
                    isModified={isModified}
                    triggerAutoSave={() => {}}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}