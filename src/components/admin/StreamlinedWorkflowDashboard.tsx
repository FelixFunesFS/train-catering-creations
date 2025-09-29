import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  DollarSign, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  Utensils
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';
import { UnifiedEmailReviewModal } from './UnifiedEmailReviewModal';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface StreamlinedWorkflowDashboardProps {
  onBack: () => void;
}

export function StreamlinedWorkflowDashboard({ onBack }: StreamlinedWorkflowDashboardProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [taxRate, setTaxRate] = useState(8.5);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [quickPricingTier, setQuickPricingTier] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .in('status', ['pending', 'reviewed', 'quoted', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRequest = async (request: any) => {
    setSelectedRequest(request);
    setProcessingStep('loading');

    try {
      // Check if invoice already exists
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*, invoice_line_items(*)')
        .eq('quote_request_id', request.id)
        .single();

      if (existingInvoice) {
        setInvoice(existingInvoice);
        setLineItems(existingInvoice.invoice_line_items || []);
        setProcessingStep('pricing');
      } else {
        // Auto-generate invoice
        await generateAutoInvoice(request);
      }
    } catch (error) {
      console.error('Error selecting request:', error);
      setProcessingStep(null);
    }
  };

  const generateAutoInvoice = async (request: any) => {
    setProcessingStep('generating');

    try {
      // Generate line items
      const generated = generateProfessionalLineItems(request);
      const processedItems = generated.map((item, index) => ({
        id: `item-${index}`,
        title: item.title,
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: 0, // Start with $0 for admin pricing
        total_price: 0,
        category: item.category || 'other'
      }));

      // Create draft invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: request.id,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          status: 'draft',
          document_type: 'estimate',
          is_draft: true
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items
      const lineItemsData = processedItems.map(item => ({
        invoice_id: newInvoice.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      setInvoice(newInvoice);
      setLineItems(processedItems);
      setProcessingStep('pricing');

      toast({
        title: "Auto-Invoice Generated",
        description: "Draft invoice created with line items ready for pricing",
      });

    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice automatically",
        variant: "destructive"
      });
      setProcessingStep(null);
    }
  };

  const applyQuickPricing = async (tier: string) => {
    if (!selectedRequest || !invoice) return;

    setProcessingStep('pricing-update');

    const pricingTiers = {
      budget: 15,   // $15 per person
      standard: 25, // $25 per person
      premium: 35,  // $35 per person
      luxury: 45    // $45 per person
    };

    const basePricePerPerson = pricingTiers[tier as keyof typeof pricingTiers];
    const totalGuests = selectedRequest.guest_count;
    const targetTotal = basePricePerPerson * totalGuests * 100; // Convert to cents

    try {
      // Distribute pricing across line items proportionally
      const totalItems = lineItems.length;
      const baseItemPrice = Math.floor(targetTotal / totalItems);
      const remainder = targetTotal % totalItems;

      const updatedItems = lineItems.map((item, index) => {
        const itemPrice = baseItemPrice + (index < remainder ? 1 : 0);
        return {
          ...item,
          unit_price: itemPrice,
          total_price: itemPrice * item.quantity
        };
      });

      // Calculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = isGovernmentContract ? 0 : Math.round((subtotal * taxRate) / 100);
      const total = subtotal + taxAmount;

      // Update database
      await supabase
        .from('invoices')
        .update({
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          status: 'draft'
        })
        .eq('id', invoice.id);

      // Update line items
      for (const item of updatedItems) {
        await supabase
          .from('invoice_line_items')
          .update({
            unit_price: item.unit_price,
            total_price: item.total_price
          })
          .eq('invoice_id', invoice.id)
          .eq('title', item.title);
      }

      setLineItems(updatedItems);
      setInvoice(prev => ({ ...prev, subtotal, tax_amount: taxAmount, total_amount: total }));
      setQuickPricingTier(tier);
      setProcessingStep('ready-to-send');

      toast({
        title: "Quick Pricing Applied",
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier pricing ($${basePricePerPerson}/person) applied`,
      });

    } catch (error) {
      console.error('Error applying pricing:', error);
      toast({
        title: "Error",
        description: "Failed to apply pricing",
        variant: "destructive"
      });
      setProcessingStep('pricing');
    }
  };

  const openEmailReview = () => {
    setEmailModalOpen(true);
  };

  const handleEmailSent = () => {
    fetchRequests();
    setSelectedRequest(null);
    setInvoice(null);
    setLineItems([]);
    setProcessingStep(null);
    setQuickPricingTier('');
  };

  const getStepIcon = (step: string, isActive: boolean, isComplete: boolean) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-400'}`;
    
    switch (step) {
      case 'auto-invoice':
        return <FileText className={iconClass} />;
      case 'pricing':
        return <DollarSign className={iconClass} />;
      case 'email':
        return <Mail className={iconClass} />;
      case 'sent':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = isGovernmentContract ? 0 : Math.round((subtotal * taxRate) / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Streamlined Workflow</h1>
          <p className="text-muted-foreground">Auto-generate invoices with quick pricing and email review</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              New Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              </div>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending requests</p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => selectRequest(request)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{request.event_name}</h4>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.event_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {request.guest_count} guests
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRequest ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a request to start processing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Steps */}
                <div className="space-y-3">
                  {[
                    { id: 'auto-invoice', label: 'Auto-Invoice Generated', complete: processingStep !== null },
                    { id: 'pricing', label: 'Quick Pricing Applied', complete: processingStep === 'ready-to-send' },
                    { id: 'email', label: 'Email Review & Send', complete: false },
                    { id: 'sent', label: 'Sent to Customer', complete: false }
                  ].map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      {getStepIcon(step.id, processingStep === step.id, step.complete)}
                      <span className={`text-sm ${step.complete ? 'text-green-600' : processingStep === step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Current Step Actions */}
                {processingStep === 'generating' && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Generating invoice...</p>
                  </div>
                )}

                {processingStep === 'pricing' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Pricing Tiers</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'budget', label: 'Budget', price: 15, color: 'bg-gray-100' },
                        { id: 'standard', label: 'Standard', price: 25, color: 'bg-blue-100' },
                        { id: 'premium', label: 'Premium', price: 35, color: 'bg-purple-100' },
                        { id: 'luxury', label: 'Luxury', price: 45, color: 'bg-amber-100' }
                      ].map((tier) => (
                        <Button
                          key={tier.id}
                          variant="outline"
                          size="sm"
                          className={`h-auto p-3 ${tier.color}`}
                          onClick={() => applyQuickPricing(tier.id)}
                        >
                          <div className="text-center">
                            <div className="font-medium">{tier.label}</div>
                            <div className="text-xs">${tier.price}/person</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {processingStep === 'ready-to-send' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Ready to Send</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {quickPricingTier.charAt(0).toUpperCase() + quickPricingTier.slice(1)} pricing applied
                      </p>
                    </div>

                    <Button 
                      onClick={openEmailReview} 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Review & Send Email
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRequest ? (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a request to see pricing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Event Details */}
                <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                  <h4 className="font-medium">{selectedRequest.event_name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{selectedRequest.guest_count} guests</div>
                    <div>{new Date(selectedRequest.event_date).toLocaleDateString()}</div>
                    <div>{selectedRequest.service_type}</div>
                  </div>
                </div>

                {/* Pricing Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gov-contract">Government Contract</Label>
                    <Switch
                      id="gov-contract"
                      checked={isGovernmentContract}
                      onCheckedChange={setIsGovernmentContract}
                    />
                  </div>
                  
                  {!isGovernmentContract && (
                    <div>
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal / 100)}</span>
                  </div>
                  
                  {!isGovernmentContract && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({taxRate}%):</span>
                      <span>{formatCurrency(totals.taxAmount / 100)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total / 100)}</span>
                  </div>
                  
                  {selectedRequest && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Per Person:</span>
                      <span>{formatCurrency(totals.total / selectedRequest.guest_count / 100)}</span>
                    </div>
                  )}
                </div>

                {/* Line Items Summary */}
                {lineItems.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Line Items ({lineItems.length})</h5>
                      <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                        {lineItems.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="truncate mr-2">{item.title}</span>
                            <span>{formatCurrency(item.total_price / 100)}</span>
                          </div>
                        ))}
                        {lineItems.length > 5 && (
                          <div className="text-center">...and {lineItems.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Review Modal */}
      <UnifiedEmailReviewModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        emailType="estimate"
        invoice={invoice}
        quoteRequest={selectedRequest}
        lineItems={lineItems}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}