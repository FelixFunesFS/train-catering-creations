import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CustomerEditor } from './CustomerEditor';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceByQuote, useInvoicePaymentSummary } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { formatMenuDescription } from '@/utils/invoiceFormatters';
import { formatLocationLink, formatPhoneLink } from '@/utils/linkFormatters';
import { User, Calendar, MapPin, Users, Utensils, FileText, Loader2, Package, Eye, Pencil, Receipt, Play, CheckCircle, XCircle, MessageSquare, PartyPopper, Leaf, Phone, ExternalLink } from 'lucide-react';
import { useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { EstimateEditor } from '@/components/admin/billing/EstimateEditor';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface EventDetailProps {
  quote: QuoteRequest;
  onClose: () => void;
}

function formatServiceType(type: string): string {
  const map: Record<string, string> = {
    'delivery-only': 'Delivery Only',
    'delivery-setup': 'Delivery + Setup',
    'full-service': 'Full-Service Catering',
  };
  return map[type] || type;
}

function formatMenuItems(items: unknown): string {
  if (!items || !Array.isArray(items)) return 'None';
  if (items.length === 0) return 'None';
  return items.map(item => formatMenuDescription(String(item))).join(', ');
}

export function EventDetail({ quote, onClose }: EventDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEstimateEditor, setShowEstimateEditor] = useState(false);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if estimate already exists
  const { data: existingInvoice, isLoading: checkingInvoice, refetch: refetchInvoice } = useInvoiceByQuote(quote.id);
  
  // Fetch full invoice payment summary for EstimateEditor (either existing or newly generated)
  const invoiceIdToShow = generatedInvoiceId || existingInvoice?.id;
  const { data: fullInvoice } = useInvoicePaymentSummary(invoiceIdToShow);
  
  const updateStatus = useUpdateQuoteStatus();

  const handleStatusChange = async (newStatus: 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateStatus.mutateAsync({ quoteId: quote.id, status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Event marked as ${newStatus.replace('_', ' ')}`,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleViewEstimate = () => {
    if (!existingInvoice) return;
    setShowEstimateEditor(true);
  };

  const handleGenerateEstimate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quote.id }
      });

      if (error) throw error;

      toast({
        title: 'Estimate Generated',
        description: 'Opening estimate editor...',
      });
      
      // Set the generated invoice ID and show the editor
      setGeneratedInvoiceId(data.invoice_id);
      setShowEstimateEditor(true);
      refetchInvoice();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate estimate',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseEstimateEditor = () => {
    setShowEstimateEditor(false);
    setGeneratedInvoiceId(null);
    refetchInvoice();
  };

  // If showing estimate editor, render it instead of event detail
  if (showEstimateEditor && fullInvoice) {
    return (
      <EstimateEditor 
        invoice={fullInvoice} 
        onClose={handleCloseEstimateEditor} 
      />
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {quote.event_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            
            {isEditing ? (
              <CustomerEditor 
                quote={quote} 
                onSave={() => {
                  setIsEditing(false);
                  onClose();
                }} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{quote.contact_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{quote.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <a 
                    href={formatPhoneLink(quote.phone) || '#'} 
                    className="font-medium text-primary hover:underline flex items-center gap-1 min-h-[44px] py-2"
                    aria-label="Call customer"
                  >
                    <Phone className="h-4 w-4" />
                    {quote.phone}
                  </a>
                </div>
                {quote.compliance_level === 'government' && (
                  <div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                      Government (Tax Exempt)
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* Event Details */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              Event Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{format(new Date(quote.event_date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">{quote.start_time || 'TBD'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location:
                </span>
                <a 
                  href={formatLocationLink(quote.location) || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1 min-h-[44px] py-2"
                  aria-label="Open in Maps"
                >
                  {quote.location}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Guests:
                </span>
                <p className="font-medium">{quote.guest_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Service:</span>
                <p className="font-medium">{formatServiceType(quote.service_type)}</p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <PartyPopper className="h-3 w-3" /> Event Type:
                </span>
                <p className="font-medium capitalize">{quote.event_type?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Menu Selections */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Utensils className="h-4 w-4" />
              Menu Selections
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Proteins:</span>
                <p className="font-medium">{formatMenuItems(quote.proteins)}</p>
              </div>
              {quote.both_proteins_available && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  ⭐ Both proteins served to all guests
                </Badge>
              )}
              <div>
                <span className="text-muted-foreground">Sides:</span>
                <p className="font-medium">{formatMenuItems(quote.sides)}</p>
              </div>
              {quote.appetizers && (quote.appetizers as any[]).length > 0 && (
                <div>
                  <span className="text-muted-foreground">Appetizers:</span>
                  <p className="font-medium">{formatMenuItems(quote.appetizers)}</p>
                </div>
              )}
              {quote.desserts && (quote.desserts as any[]).length > 0 && (
                <div>
                  <span className="text-muted-foreground">Desserts:</span>
                  <p className="font-medium">{formatMenuItems(quote.desserts)}</p>
                </div>
              )}
              {quote.drinks && (quote.drinks as any[]).length > 0 && (
                <div>
                  <span className="text-muted-foreground">Beverages:</span>
                  <p className="font-medium">{formatMenuItems(quote.drinks)}</p>
                </div>
              )}
              {/* Vegetarian Options - consolidated here in Menu Selections */}
              {(quote.guest_count_with_restrictions || (quote.vegetarian_entrees && (quote.vegetarian_entrees as any[]).length > 0)) && (
                <div className="pt-2 mt-2 border-t border-green-200 dark:border-green-800">
                  <span className="text-green-700 dark:text-green-400 text-xs uppercase tracking-wide flex items-center gap-1">
                    <Leaf className="h-3 w-3" /> Vegetarian Options
                  </span>
                  {quote.guest_count_with_restrictions && (
                    <p className="font-medium text-green-700 dark:text-green-300">{quote.guest_count_with_restrictions} vegetarian portions</p>
                  )}
                  {quote.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && (quote.vegetarian_entrees as any[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(quote.vegetarian_entrees as string[]).map((entree, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 text-xs">
                          {entree.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Additional Notes - only special requests, wedding details, referral */}
          {(quote.special_requests || quote.event_type === 'wedding' || quote.referral_source) && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4" />
                  Additional Notes
                </h3>
                <div className="space-y-3 text-sm">
                  {quote.event_type === 'wedding' && (
                    <div className="flex flex-wrap gap-2">
                      {quote.ceremony_included && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          💒 Ceremony Included
                        </Badge>
                      )}
                      {quote.cocktail_hour && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          🥂 Cocktail Hour
                        </Badge>
                      )}
                      {quote.theme_colors && (
                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                          🎨 Theme: {quote.theme_colors}
                        </Badge>
                      )}
                    </div>
                  )}
                  {quote.special_requests && (
                    <div>
                      <span className="text-muted-foreground">Special Requests:</span>
                      <p className="font-medium mt-1 italic">{quote.special_requests}</p>
                    </div>
                  )}
                  {quote.referral_source && (
                    <div>
                      <span className="text-muted-foreground">Referral Source:</span>
                      <span className="font-medium ml-2">{quote.referral_source}</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Supplies & Equipment */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Package className="h-4 w-4" />
              Supplies & Equipment Requested
            </h3>
            {(() => {
              const supplies = [
                quote.plates_requested && 'Plates',
                quote.cups_requested && 'Cups',
                quote.napkins_requested && 'Napkins',
                quote.serving_utensils_requested && 'Serving Utensils',
                quote.chafers_requested && 'Chafing Dishes',
                quote.ice_requested && 'Ice',
              ].filter(Boolean);
              
              return supplies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {supplies.map((item) => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None requested</p>
              );
            })()}
          </section>

          {/* Event Status Actions */}
          {quote.workflow_status !== 'cancelled' && quote.workflow_status !== 'completed' && quote.workflow_status !== 'pending' && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold mb-3">Event Status Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quote.workflow_status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange('in_progress')}
                      disabled={updateStatus.isPending}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  
                  {(quote.workflow_status === 'confirmed' || quote.workflow_status === 'in_progress') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Event
                  </Button>
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {existingInvoice ? (
              (() => {
                const status = existingInvoice.workflow_status;
                const isInvoice = ['approved', 'paid', 'partially_paid', 'payment_pending'].includes(status);
                const isDraft = status === 'draft';
                
                return (
                  <Button onClick={handleViewEstimate}>
                    {isInvoice ? (
                      <>
                        <Receipt className="h-4 w-4 mr-2" />
                        View Invoice
                      </>
                    ) : isDraft ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Estimate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Estimate
                      </>
                    )}
                  </Button>
                );
              })()
            ) : (
              <Button 
                onClick={handleGenerateEstimate} 
                disabled={isGenerating || checkingInvoice}
              >
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Estimate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
