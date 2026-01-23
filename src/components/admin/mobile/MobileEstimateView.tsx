import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaxCalculationService } from '@/services/TaxCalculationService';
import { useInvoice, useInvoiceWithMilestones } from '@/hooks/useInvoices';
import { useLineItems, useDeleteLineItem } from '@/hooks/useLineItems';
import { useEditableInvoice } from '@/hooks/useEditableInvoice';
import { usePaymentScheduleSync } from '@/hooks/usePaymentScheduleSync';
import { useEstimateActions } from '@/hooks/useEstimateActions';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  User,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Save,
  Send,
  Plus,
  AlertCircle,
  Loader2,
  Download,
  Pencil,
  Building2,
  Clock,
  Truck,
  Palette,
  PartyPopper,
  Utensils,
  Package,
  RefreshCw,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { formatTime, formatServiceType, formatEventType, formatReferralSource } from '@/utils/formatters';
import { useRegenerateLineItems } from '@/hooks/useRegenerateLineItems';
import { AddLineItemModal } from '@/components/admin/billing/AddLineItemModal';
import { EmailPreview } from '@/components/admin/billing/EmailPreview';
import { DiscountEditor } from '@/components/admin/billing/DiscountEditor';
import { LineItemEditor } from '@/components/admin/billing/LineItemEditor';
import { CustomerEditor } from '@/components/admin/events/CustomerEditor';

interface MobileEstimateViewProps {
  quote: any;
  invoice: any;
  onClose: () => void;
}

export function MobileEstimateView({ quote, invoice, onClose }: MobileEstimateViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);
  
  // Collapsible sections
  const [eventOpen, setEventOpen] = useState(true);
  const [estimateOpen, setEstimateOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  

  // Data queries
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice?.id);
  const { data: currentInvoice } = useInvoice(invoice?.id);
  const { data: invoiceWithMilestones } = useInvoiceWithMilestones(invoice?.id);
  const milestones = invoiceWithMilestones?.milestones || [];
  const deleteLineItem = useDeleteLineItem();
  const { mutate: regenerateLineItems, isPending: isRegeneratingItems } = useRegenerateLineItems();
  // Use the unified editable invoice hook
  const {
    localLineItems: editableLineItems,
    customerNotes,
    adminNotes,
    updateLineItem: updateLocalLineItem,
    setCustomerNotes,
    setAdminNotes,
    hasUnsavedChanges,
    dirtyItemIds,
    saveAllChanges,
    discardAllChanges,
    isSaving,
  } = useEditableInvoice(invoice?.id, lineItems || [], currentInvoice?.notes);

  const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

  // Use shared estimate actions hook
  const {
    handleGenerateEstimate,
    isGenerating,
    handleSendEstimate,
    isSending,
    handleDownloadPdf,
    handleApplyDiscount,
    handleRemoveDiscount,
    handleToggleGovernment,
    handleRegenerateMilestones,
    isRegenerating,
  } = useEstimateActions({
    quoteId: quote?.id,
    invoiceId: invoice?.id,
    invoiceNumber: invoice?.invoice_number,
    onClose,
  });

  usePaymentScheduleSync({
    invoiceId: invoice?.id,
    totalAmount: currentInvoice?.total_amount ?? 0,
    isGovernment,
    enabled: !!invoice?.id && !hasUnsavedChanges,
  });

  const sortedLineItems = useMemo(() => {
    if (!lineItems) return [];
    return [...lineItems].sort((a, b) => {
      const sortA = a.sort_order ?? 0;
      const sortB = b.sort_order ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [lineItems]);

  // Line item handlers
  const handlePriceChange = useCallback((lineItemId: string, newPrice: number) => {
    updateLocalLineItem(lineItemId, { unit_price: newPrice });
  }, [updateLocalLineItem]);

  const handleQuantityChange = useCallback((lineItemId: string, newQuantity: number) => {
    updateLocalLineItem(lineItemId, { quantity: newQuantity });
  }, [updateLocalLineItem]);

  const handleDescriptionChange = useCallback((lineItemId: string, newDescription: string) => {
    updateLocalLineItem(lineItemId, { description: newDescription });
  }, [updateLocalLineItem]);

  const handleDeleteItem = useCallback(async (lineItemId: string) => {
    await deleteLineItem.mutateAsync({ lineItemId, invoiceId: invoice?.id });
  }, [deleteLineItem, invoice?.id]);

  // Send handlers
  const handlePreviewClick = useCallback(() => {
    if (hasUnsavedChanges) {
      toast({ title: 'Unsaved Changes', description: 'Please save first.', variant: 'destructive' });
      return;
    }
    setIsResendMode(false);
    setShowPreview(true);
  }, [hasUnsavedChanges, toast]);

  const handleResendClick = useCallback(() => {
    setIsResendMode(true);
    setShowPreview(true);
  }, []);

  const handleConfirmSend = useCallback(async (overrideEmail?: string) => {
    await handleSendEstimate(overrideEmail, isResendMode);
    setShowPreview(false);
  }, [handleSendEstimate, isResendMode]);

  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;
  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  // Totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    if (!hasUnsavedChanges && currentInvoice) {
      return {
        subtotal: currentInvoice.subtotal ?? 0,
        taxAmount: currentInvoice.tax_amount ?? 0,
        total: currentInvoice.total_amount ?? 0,
      };
    }
    
    const calculatedSubtotal = editableLineItems.reduce(
      (sum, item) => sum + (item.total_price || 0), 
      0
    );
    
    const taxCalc = TaxCalculationService.calculateTaxWithDiscount(
      calculatedSubtotal,
      discountAmount,
      discountType,
      discountDescription,
      isGovernment
    );
    
    return {
      subtotal: calculatedSubtotal,
      taxAmount: taxCalc.taxAmount,
      total: taxCalc.totalAmount,
    };
  }, [hasUnsavedChanges, currentInvoice, editableLineItems, discountAmount, discountType, discountDescription, isGovernment]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (showPreview) {
    return (
      <EmailPreview
        invoice={{ ...invoice, quote_id: quote?.id, email: quote?.email, contact_name: quote?.contact_name }}
        onClose={() => setShowPreview(false)}
        onConfirmSend={handleConfirmSend}
        isSending={isSending}
        isResend={isResendMode}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-sm truncate max-w-[180px]">
              {quote?.event_name || 'Event Details'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {quote?.contact_name}
            </p>
          </div>
        </div>
        {invoice?.invoice_number && (
          <Badge variant="outline" className="text-xs">
            {invoice.invoice_number}
          </Badge>
        )}
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-32">
          
          {/* Event Summary Section */}
          <Collapsible open={eventOpen} onOpenChange={setEventOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Event Details
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); setShowCustomerEdit(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {eventOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Date</p>
                        <p className="font-medium">
                          {quote?.event_date ? format(new Date(quote.event_date), 'MMM d, yyyy') : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Start Time</p>
                        <p className="font-medium">{quote?.start_time ? formatTime(quote.start_time) : 'TBD'}</p>
                        {quote?.serving_start_time && quote.serving_start_time !== quote.start_time && (
                          <p className="text-xs text-muted-foreground">Serving: {formatTime(quote.serving_start_time)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Guests</p>
                        <p className="font-medium">{quote?.guest_count || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <PartyPopper className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Event Type</p>
                        <p className="font-medium">{quote?.event_type ? formatEventType(quote.event_type) : 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Service Type</p>
                        <p className="font-medium">{quote?.service_type ? formatServiceType(quote.service_type) : 'TBD'}</p>
                      </div>
                    </div>
                    {quote?.theme_colors && (
                      <div className="flex items-start gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground text-xs">Theme/Colors</p>
                          <p className="font-medium">{quote.theme_colors}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-medium">{quote?.location || 'TBD'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Contact</p>
                      <p className="font-medium">{quote?.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{quote?.email}</p>
                      <p className="text-xs text-muted-foreground">{quote?.phone}</p>
                    </div>
                  </div>

                  {/* Government Contract Toggle */}
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium">Government Contract</Label>
                        <p className="text-xs text-muted-foreground">Tax exempt, Net 30 terms</p>
                      </div>
                    </div>
                    <Switch
                      checked={isGovernment}
                      onCheckedChange={handleToggleGovernment}
                      disabled={isRegenerating}
                    />
                  </div>

                  {/* Menu Selections - Collapsible */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer">
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Utensils className="h-3 w-3" /> Menu Selections
                        </p>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 space-y-2">
                      {/* Appetizers */}
                      {quote?.appetizers && Array.isArray(quote.appetizers) && quote.appetizers.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Appetizers</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.appetizers.map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Proteins */}
                      {quote?.proteins && Array.isArray(quote.proteins) && quote.proteins.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Proteins {quote.both_proteins_available && <span className="text-primary">(Both Available)</span>}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.proteins.map((item: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Vegetarian Entrées */}
                      {quote?.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && quote.vegetarian_entrees.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Vegetarian {quote.guest_count_with_restrictions && `(${quote.guest_count_with_restrictions} guests)`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.vegetarian_entrees.map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 border-green-500/30">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Sides */}
                      {quote?.sides && Array.isArray(quote.sides) && quote.sides.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Sides</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.sides.map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Desserts */}
                      {quote?.desserts && Array.isArray(quote.desserts) && quote.desserts.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Desserts</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.desserts.map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Beverages */}
                      {quote?.drinks && Array.isArray(quote.drinks) && quote.drinks.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Beverages</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.drinks.map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Supplies & Equipment */}
                  {(quote?.plates_requested || quote?.cups_requested || quote?.napkins_requested || 
                    quote?.serving_utensils_requested || quote?.chafers_requested || quote?.ice_requested) && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Package className="h-3 w-3" /> Supplies & Equipment
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {quote.plates_requested && <Badge variant="outline" className="text-xs">Plates</Badge>}
                        {quote.cups_requested && <Badge variant="outline" className="text-xs">Cups</Badge>}
                        {quote.napkins_requested && <Badge variant="outline" className="text-xs">Napkins</Badge>}
                        {quote.serving_utensils_requested && <Badge variant="outline" className="text-xs">Serving Utensils</Badge>}
                        {quote.chafers_requested && <Badge variant="outline" className="text-xs">Chafers</Badge>}
                        {quote.ice_requested && <Badge variant="outline" className="text-xs">Ice</Badge>}
                      </div>
                    </div>
                  )}

                  {/* Service Add-ons */}
                  {(quote?.wait_staff_requested || quote?.bussing_tables_needed || 
                    quote?.ceremony_included || quote?.cocktail_hour) && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {quote.wait_staff_requested && <Badge variant="outline" className="text-xs">Wait Staff</Badge>}
                        {quote.bussing_tables_needed && <Badge variant="outline" className="text-xs">Table Bussing</Badge>}
                        {quote.ceremony_included && <Badge variant="outline" className="text-xs">Ceremony</Badge>}
                        {quote.cocktail_hour && <Badge variant="outline" className="text-xs">Cocktail Hour</Badge>}
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  {quote?.special_requests && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Special Requests</p>
                      <p className="text-sm">{quote.special_requests}</p>
                    </div>
                  )}

                  {/* Referral Source */}
                  {quote?.referral_source && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" /> Found us via: {formatReferralSource(quote.referral_source)}
                      </p>
                    </div>
                  )}

                  {/* Edit Menu Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (!quote?.id) return;
                      navigate(`/admin/event/${quote.id}/menu`);
                    }}
                    className="w-full"
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit Menu Selections
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Estimate Section */}
          <Collapsible open={estimateOpen} onOpenChange={setEstimateOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Estimate
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatCurrency(total)}</span>
                      {estimateOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {!invoice ? (
                    <Button 
                      onClick={handleGenerateEstimate} 
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Estimate
                    </Button>
                  ) : (
                    <>
                      {/* Line Items */}
                      <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                            <span className="text-sm font-medium">
                              Line Items ({sortedLineItems.length})
                            </span>
                            {itemsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {loadingItems ? (
                            <div className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </div>
                          ) : (
                            <>
                              {editableLineItems.map((item) => (
                                <LineItemEditor
                                  key={item.id}
                                  item={item}
                                  onPriceChange={(price) => handlePriceChange(item.id, price)}
                                  onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                                  onDescriptionChange={(desc) => handleDescriptionChange(item.id, desc)}
                                  onDelete={() => handleDeleteItem(item.id)}
                                  isUpdating={isSaving}
                                  isDirty={dirtyItemIds.has(item.id)}
                                />
                              ))}
                              <Button 
                                variant="outline" 
                                className="w-full min-h-[44px]"
                                onClick={() => setShowAddItem(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="w-full text-xs text-muted-foreground"
                                onClick={() => regenerateLineItems({ invoiceId: invoice.id, quoteId: quote.id })}
                                disabled={isRegeneratingItems || hasUnsavedChanges}
                              >
                                <RefreshCw className={`h-3 w-3 mr-1 ${isRegeneratingItems ? 'animate-spin' : ''}`} />
                                Regenerate from Quote
                              </Button>
                            </>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Customer Notes */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Notes for Customer</Label>
                        <Textarea
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Notes visible to customer..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <Separator />

                      {/* Admin Notes (Internal) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Admin Notes (Internal)</Label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Internal notes..."
                          className="min-h-[60px]"
                        />
                      </div>

                      <Separator />

                      {/* Discount Editor */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium">Discount</span>
                        <DiscountEditor
                          discountAmount={discountAmount}
                          discountType={discountType}
                          discountDescription={discountDescription}
                          subtotal={subtotal}
                          onApplyDiscount={handleApplyDiscount}
                          onRemoveDiscount={handleRemoveDiscount}
                          disabled={isSaving}
                        />
                      </div>

                      <Separator />

                      {/* Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-destructive">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountType === 'percentage' ? Math.round(subtotal * discountAmount / 100) : discountAmount)}</span>
                          </div>
                        )}
                        {!isGovernment && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (9%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                        )}
                        {isGovernment && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <Badge variant="secondary" className="text-xs">Exempt</Badge>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Payment Milestones */}
          {milestones.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Payment Schedule
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRegenerateMilestones}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {milestones.map((milestone: any) => {
                  const getMilestoneLabel = (type: string) => {
                    switch (type) {
                      case 'deposit': return 'Booking Deposit';
                      case 'combined': return 'Booking Deposit';
                      case 'milestone': return 'Milestone Payment';
                      case 'balance': return 'Final Balance';
                      case 'full': return 'Full Payment';
                      case 'final': return 'Full Payment (Net 30)';
                      default: return type.replace('_', ' ');
                    }
                  };
                  return (
                    <div 
                      key={milestone.id}
                      className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{getMilestoneLabel(milestone.milestone_type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {milestone.percentage}%
                          {milestone.due_date && ` • Due ${format(new Date(milestone.due_date), 'MMM d')}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(milestone.amount_cents)}</p>
                        <Badge variant={milestone.status === 'paid' ? 'default' : 'outline'} className="text-xs">
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 safe-area-inset-bottom">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-400 flex-1">Unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={discardAllChanges}>
              Discard
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {hasUnsavedChanges ? (
            <Button 
              onClick={saveAllChanges} 
              disabled={isSaving}
              className="col-span-2 min-h-[44px]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!invoice} className="min-h-[44px]">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                onClick={isAlreadySent ? handleResendClick : handlePreviewClick} 
                disabled={!invoice}
                className="min-h-[44px]"
              >
                <Send className="h-4 w-4 mr-2" />
                {isAlreadySent ? 'Resend' : 'Send'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add Line Item Modal */}
      {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}

      {/* Customer Edit Dialog */}
      <Dialog open={showCustomerEdit} onOpenChange={setShowCustomerEdit}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer & Event</DialogTitle>
          </DialogHeader>
          <CustomerEditor
            quote={quote} 
            onSave={() => {
              setShowCustomerEdit(false);
              queryClient.invalidateQueries({ queryKey: ['quotes'] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
