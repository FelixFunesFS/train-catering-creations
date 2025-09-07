import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstimatePreviewModal } from '@/components/admin/EstimatePreviewModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLineItemManagement } from '@/hooks/useLineItemManagement';
import { PaymentScheduleDisplay } from '@/components/admin/PaymentScheduleDisplay';
import { ConsolidatedPhaseCard } from '@/components/admin/ConsolidatedPhaseCard';
import { EnhancedEstimateLineItems } from '@/components/admin/EnhancedEstimateLineItems';
import { type LineItem as UtilsLineItem } from '@/utils/invoiceFormatters';
import { ArrowLeft, Eye, Send, DollarSign, CheckCircle2, Clock, Plus, Calendar, User, Mail, MapPin } from 'lucide-react';

interface StreamlinedEstimateInterfaceProps {
  quoteId?: string;
  invoiceId?: string;
}

interface EstimateData {
  id: string;
  document_type: 'estimate' | 'invoice';
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_email: string;
  customer_name: string;
  event_name: string;
  event_date: string;
  guest_count?: number;
  location?: string;
  line_items: any[];
  payment_milestones?: any[];
  quote_request_id?: string;
}

export function StreamlinedEstimateInterface({ quoteId, invoiceId: propInvoiceId }: StreamlinedEstimateInterfaceProps) {
  const { invoiceId: paramInvoiceId } = useParams();
  const invoiceId = propInvoiceId || paramInvoiceId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [paymentMilestones, setPaymentMilestones] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>(null);

  // Initialize line item management with real-time calculations
  const {
    lineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    addTemplateItem,
    quickCalculatePerPerson,
    resetLineItems,
    isModified,
    triggerAutoSave,
    calculateTotals
  } = useLineItemManagement({
    initialLineItems: estimateData?.line_items || [],
    taxRate: 8.0,
    isGovernmentContract,
    onTotalsChange: handleTotalChange,
    autoSave: true,
    invoiceId: invoiceId
  });

  // Calculate totals from line items directly
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const taxAmount = Math.round(subtotal * (8.0 / 100));
  const grandTotal = subtotal + taxAmount;

  // Handle total changes and sync with estimate data
  function handleTotalChange(totals: { subtotal: number; tax_amount: number; total_amount: number }) {
    if (estimateData) {
      setEstimateData(prev => prev ? {
        ...prev,
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        line_items: lineItems
      } : null);
    }
  }

  // Update totals when line items change
  useEffect(() => {
    if (lineItems.length > 0) {
      handleTotalChange({
        subtotal,
        tax_amount: taxAmount,
        total_amount: grandTotal
      });
    }
  }, [lineItems, subtotal, taxAmount, grandTotal]);

  useEffect(() => {
    if (invoiceId) {
      fetchEstimate();
    } else if (quoteId) {
      checkOrCreateEstimate();
    }
  }, [invoiceId, quoteId]);

  const fetchEstimate = async () => {
    if (!invoiceId) return;
    
    try {
      // Fetch invoice with related data and payment milestones
      const [invoiceResult, milestonesResult] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            *,
            customers!customer_id(*),
            quote_requests!quote_request_id(*),
            invoice_line_items(*)
          `)
          .eq('id', invoiceId)
          .single(),
        supabase
          .from('payment_milestones')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('due_date', { ascending: true })
      ]);

      if (invoiceResult.error) throw invoiceResult.error;
      const data = invoiceResult.data;
      
      const estimate = {
        id: data.id,
        document_type: (data.document_type === 'invoice' ? 'invoice' : 'estimate') as 'estimate' | 'invoice',
        status: data.status,
        total_amount: data.total_amount,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        customer_email: data.customers?.email || data.quote_requests?.email || '',
        customer_name: data.customers?.name || data.quote_requests?.contact_name || '',
        event_name: data.quote_requests?.event_name || '',
        event_date: data.quote_requests?.event_date || '',
        guest_count: data.quote_requests?.guest_count || 0,
        location: data.quote_requests?.location || '',
        line_items: data.invoice_line_items || [],
        payment_milestones: milestonesResult.data || [],
        quote_request_id: data.quote_request_id
      };

      setEstimateData(estimate);
      setPaymentMilestones(milestonesResult.data || []);
      setQuote(data.quote_requests);
      setIsGovernmentContract(data.quote_requests?.requires_po_number || false);
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
    
    try {
      // Check if estimate already exists
      const { data: existingEstimate } = await supabase
        .from('invoices')
        .select('id')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (existingEstimate) {
        // Redirect to existing estimate
        navigate(`/admin/estimates/${existingEstimate.id}`, { replace: true });
        return;
      }

      // No estimate exists, redirect to creation
      navigate(`/admin/estimates/quote/${quoteId}`, { replace: true });
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

  const handleSendEstimate = async () => {
    if (!estimateData) return;

    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: estimateData.id,
          custom_subject: `Your Estimate - ${estimateData.event_name}`,
          custom_message: `Dear ${estimateData.customer_name},\n\nThank you for considering Soul Train's Eatery for your upcoming ${estimateData.event_name}. Please review the attached estimate.\n\nWe look forward to making your event delicious!\n\nBest regards,\nSoul Train's Eatery Team`
        }
      });

      if (error) throw error;

      toast({
        title: "Estimate sent!",
        description: "The estimate has been emailed to the customer",
      });

      // Refresh data
      await fetchEstimate();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Failed to send estimate",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!estimateData) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: estimateData.id,
          amount: estimateData.total_amount,
          customer_email: estimateData.customer_email,
          description: `Payment for ${estimateData.event_name}`
        }
      });

      if (error) throw error;

      // Copy link to clipboard
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
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary' as const, label: 'Draft', icon: Clock };
      case 'sent':
        return { variant: 'default' as const, label: 'Sent', icon: Send };
      case 'approved':
        return { variant: 'default' as const, label: 'Approved', icon: CheckCircle2 };
      case 'paid':
        return { variant: 'default' as const, label: 'Paid', icon: DollarSign };
      default:
        return { variant: 'secondary' as const, label: status, icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!estimateData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Estimate not found</div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(estimateData.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {estimateData.document_type === 'estimate' ? 'Estimate' : 'Invoice'} #{estimateData.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              {estimateData.event_name} • {estimateData.customer_name}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreviewModal(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {estimateData.status === 'draft' && (
            <Button onClick={handleSendEstimate}>
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
          )}
          {estimateData.status !== 'draft' && (
            <Button onClick={handleCreatePaymentLink}>
              <DollarSign className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview & Actions</TabsTrigger>
          <TabsTrigger value="details">Line Items & Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comprehensive Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer & Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Customer</div>
                          <div className="font-medium">{estimateData.customer_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-medium">{estimateData.customer_email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Event</div>
                          <div className="font-medium">{estimateData.event_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Date & Location</div>
                          <div className="font-medium">
                            {estimateData.event_date ? new Date(estimateData.event_date).toLocaleDateString() : 'Not set'}
                            {estimateData.location && ` • ${estimateData.location}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span className="font-medium">${(taxAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold text-lg">Total Amount:</span>
                      <span className="font-semibold text-lg text-primary">
                        ${(grandTotal / 100).toFixed(2)}
                      </span>
                    </div>
                    {estimateData.guest_count && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Per Guest:</span>
                        <span>${(grandTotal / 100 / estimateData.guest_count).toFixed(2)}</span>
                      </div>
                    )}
                    {isModified && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        Changes detected - auto-saving...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              {paymentMilestones.length > 0 && (
                <PaymentScheduleDisplay
                  milestones={paymentMilestones}
                  customerType={isGovernmentContract ? 'GOV' : 'PERSON'}
                  totalAmount={grandTotal}
                  eventDate={estimateData.event_date}
                />
              )}
            </div>

            {/* Combined Actions & Next Steps */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Estimate
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('details')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Edit Line Items
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/admin/estimates/quote/${quoteId || 'edit'}`)}
                    >
                      Edit Details
                    </Button>
                    {estimateData.status !== 'draft' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleCreatePaymentLink}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payment Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Progress */}
              {quote && (
                <ConsolidatedPhaseCard
                  currentPhase="quote"
                  currentPhaseSteps={[]}
                  getStepStatus={() => 'upcoming'}
                  nextAction={{
                    action: estimateData.status === 'draft' ? 'send_estimate' : 'create_payment',
                    title: estimateData.status === 'draft' ? 'Send Estimate' : 'Create Payment Link',
                    description: estimateData.status === 'draft' 
                      ? 'Send estimate to customer for approval' 
                      : 'Generate payment link for customer',
                    icon: estimateData.status === 'draft' ? Send : DollarSign,
                    canExecute: true,
                    estimatedTime: '2-3 minutes'
                  }}
                  onActionClick={estimateData.status === 'draft' ? () => handleSendEstimate() : () => handleCreatePaymentLink()}
                  loading={false}
                  error={null}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {/* Enhanced Line Items with real-time calculations */}
          <div className="space-y-6">
            {estimateData && (
              <EnhancedEstimateLineItems
                lineItems={lineItems as UtilsLineItem[]}
                subtotal={subtotal}
                taxAmount={taxAmount}
                grandTotal={grandTotal}
                updateLineItem={updateLineItem}
                addLineItem={addLineItem}
                removeLineItem={removeLineItem}
                addTemplateItem={addTemplateItem}
                quickCalculatePerPerson={() => quickCalculatePerPerson(estimateData?.guest_count || 0)}
                isGovernmentContract={isGovernmentContract}
                onGovernmentToggle={setIsGovernmentContract}
                guestCount={estimateData.guest_count}
                isModified={isModified}
                triggerAutoSave={triggerAutoSave}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreviewModal && estimateData && (
        <EstimatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          estimate={{
            id: estimateData.id,
            invoice_number: `EST-${estimateData.id.slice(0, 8)}`,
            status: estimateData.status,
            total_amount: estimateData.total_amount,
            customer_name: estimateData.customer_name,
            customer_email: estimateData.customer_email,
            event_details: {
              name: estimateData.event_name,
              date: estimateData.event_date
            },
            line_items: estimateData.line_items
          }}
          quote={null}
          onEmailSent={() => {
            setShowPreviewModal(false);
            fetchEstimate();
          }}
        />
      )}
    </div>
  );
}