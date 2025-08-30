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
import { 
  formatCustomerName, 
  formatCustomerPhone, 
  generateProfessionalLineItems,
  type LineItem,
  type QuoteRequest 
} from '@/utils/invoiceFormatters';
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
  CheckCircle2
} from 'lucide-react';

// Interfaces imported from utilities

interface InvoiceEstimate {
  quote_request_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_details: {
    name: string;
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

export default function EstimateCreation() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [estimate, setEstimate] = useState<InvoiceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteData();
    }
  }, [quoteId]);

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
  };

  const updateLineItem = (itemId: string, updates: Partial<LineItem>) => {
    if (!estimate) return;

    const updatedItems = estimate.line_items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.unit_price !== undefined) {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    });

    recalculateEstimate(updatedItems);
  };

  const addLineItem = () => {
    if (!estimate) return;

    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      title: 'Custom Item',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'other'
    };

    const updatedItems = [...estimate.line_items, newItem];
    recalculateEstimate(updatedItems);
    setEditingItem(newItem.id);
  };

  const removeLineItem = (itemId: string) => {
    if (!estimate) return;

    const updatedItems = estimate.line_items.filter(item => item.id !== itemId);
    recalculateEstimate(updatedItems);
  };

  const recalculateEstimate = (items: LineItem[]) => {
    if (!estimate) return;

    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const tax_amount = Math.round(subtotal * 0.08);
    const total_amount = subtotal + tax_amount;
    const deposit_required = isGovernmentContract ? 0 : Math.round(total_amount * 0.25);

    setEstimate({
      ...estimate,
      line_items: items,
      subtotal,
      tax_amount,
      total_amount,
      deposit_required,
      is_government_contract: isGovernmentContract
    });
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
    }
  };

  const handleSaveAsEstimate = async () => {
    if (!estimate) return;

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
          status: 'estimate',
          is_draft: false,
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

      // Update quote status
      await supabase
        .from('quote_requests')
        .update({ 
          status: 'quoted',
          estimated_total: estimate.total_amount
        })
        .eq('id', estimate.quote_request_id);

      toast({
        title: "Success",
        description: "Estimate saved successfully",
      });

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


  const handleGeneratePreview = () => {
    if (!estimate) return;

    // Create a preview URL with estimate data as query params
    const previewData = {
      customer_name: estimate.customer_name,
      customer_email: estimate.customer_email,
      customer_phone: estimate.customer_phone,
      event_details: estimate.event_details,
      line_items: estimate.line_items,
      subtotal: estimate.subtotal,
      tax_amount: estimate.tax_amount,
      total_amount: estimate.total_amount,
      deposit_required: estimate.deposit_required,
      is_government_contract: estimate.is_government_contract,
      notes: estimate.notes,
      invoice_number: `EST-${Date.now()}`
    };

    // Open preview in new tab without saving
    const previewUrl = `/estimate-preview?data=${encodeURIComponent(JSON.stringify(previewData))}`;
    window.open(previewUrl, '_blank');
  };

  const handleSendEstimate = async () => {
    try {
      // First save the estimate
      const savedInvoiceId = await handleSaveAsEstimate();
      
      if (!savedInvoiceId) {
        throw new Error('Failed to save estimate');
      }

      // Send the estimate via email
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: savedInvoiceId }
      });

      if (error) throw error;

      toast({
        title: "Estimate Sent",
        description: "Estimate has been sent to the customer",
      });

      // Navigate to invoice management
      navigate('/admin/invoice-management');
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
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
              <Separator orientation="vertical" className="h-6" />
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
                    Created: {new Date().toLocaleString()} • Last saved: Auto-saving...
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveAsEstimate}
                disabled={isSaving || estimate.line_items.some(item => item.unit_price === 0)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Creating...' : 'Save as Estimate'}
              </Button>
              
              {!estimate.line_items.some(item => item.unit_price === 0) && (
                <>
                  <Button 
                    onClick={handleGeneratePreview} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleSendEstimate} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send to Customer
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

                {/* Government Contract Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="gov-contract" className="font-medium">
                        Government Contract
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Government contracts bypass deposit requirements
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="gov-contract"
                    checked={isGovernmentContract}
                    onCheckedChange={handleGovernmentToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invoice Line Items
                </CardTitle>
                <Button onClick={addLineItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                   <div className="space-y-4">
                   {estimate.line_items.map((item, index) => (
                     <div key={item.id} className="border rounded-lg p-4 hover:border-primary/20 transition-colors">
                       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                         <div className="md:col-span-2">
                           <div className="flex items-center gap-2 mb-2">
                             <Label className="text-xs text-muted-foreground uppercase tracking-wide">Item</Label>
                             {item.category && (
                               <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                 {item.category}
                               </Badge>
                             )}
                           </div>
                           {editingItem === item.id ? (
                             <div className="space-y-2">
                               <Input
                                 value={item.title}
                                 onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                                 placeholder="Item title"
                                 className="font-medium"
                               />
                               <Textarea
                                 value={item.description}
                                 onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                 placeholder="Item description"
                                 rows={2}
                                 className="text-sm"
                               />
                             </div>
                           ) : (
                             <div className="space-y-1" onClick={() => setEditingItem(item.id)}>
                               <p className="font-semibold cursor-pointer hover:text-primary transition-colors">
                                 {item.title}
                               </p>
                               <p className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                                 {item.description}
                               </p>
                             </div>
                           )}
                         </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unit_price / 100}
                            onChange={(e) => updateLineItem(item.id, { unit_price: Math.round(parseFloat(e.target.value || '0') * 100) })}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="flex items-end justify-between">
                          <div>
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingItem === item.id && (
                        <div className="flex justify-end mt-3">
                          <Button size="sm" onClick={() => setEditingItem(null)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Done Editing
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {estimate.line_items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No line items yet. Click "Add Item" to start building the estimate.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes & Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={estimate.notes || ''}
                  onChange={(e) => setEstimate({ ...estimate, notes: e.target.value })}
                  placeholder="Add any special notes or requests for this estimate..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Estimate Summary - Sidebar */}
          <div className="space-y-6">

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
      </div>
    </div>
  );
}