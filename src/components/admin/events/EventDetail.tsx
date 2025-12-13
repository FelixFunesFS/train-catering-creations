import { useState } from 'react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CustomerEditor } from './CustomerEditor';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceByQuote } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { formatMenuDescription } from '@/utils/invoiceFormatters';
import { User, Calendar, MapPin, Users, Utensils, FileText, Loader2, Package, Eye, Pencil, Receipt, Play, CheckCircle, XCircle } from 'lucide-react';
import { useUpdateQuoteStatus } from '@/hooks/useQuotes';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface EventDetailProps {
  quote: QuoteRequest;
  onClose: () => void;
}

function formatServiceType(type: string): string {
  const map: Record<string, string> = {
    'drop-off': 'Drop-Off',
    'delivery-setup': 'Delivery + Setup',
    'full-service': 'Full-Service Catering',
    'delivery-only': 'Delivery Only',
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
  const [, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check if estimate already exists
  const { data: existingInvoice, isLoading: checkingInvoice } = useInvoiceByQuote(quote.id);
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
    onClose();
    setSearchParams({ 
      view: 'billing', 
      tab: 'estimates',
      invoiceId: existingInvoice.id 
    });
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
      
      // Navigate directly to billing tab with the new invoice selected
      onClose();
      setSearchParams({ 
        view: 'billing', 
        tab: 'estimates',
        invoiceId: data.invoice_id 
      });
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <p className="font-medium">{quote.phone}</p>
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
                <p className="font-medium">{quote.location}</p>
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
              {quote.special_requests && (
                <div>
                  <span className="text-muted-foreground">Special Requests:</span>
                  <p className="font-medium">{quote.special_requests}</p>
                </div>
              )}
            </div>
          </section>

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
          <div className="flex justify-end gap-2">
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
