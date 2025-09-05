import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimatePreviewModal } from '@/components/admin/EstimatePreviewModal';
import { 
  ArrowRight, 
  Eye, 
  Send, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText,
  User,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  event_type: string;
  location: string;
  guest_count: number;
  service_type: string;
  status: string;
  estimated_total: number;
  created_at: string;
  special_requests?: string;
}

interface Invoice {
  id: string;
  document_type: 'estimate' | 'invoice';
  status: string;
  total_amount: number;
  invoice_number: string;
  created_at: string;
}

interface UnifiedQuoteWorkflowProps {
  quote: QuoteRequest;
  onRefresh?: () => void;
}

export function UnifiedQuoteWorkflow({ quote, onRefresh }: UnifiedQuoteWorkflowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(quote.estimated_total || 0);

  useEffect(() => {
    checkExistingInvoice();
  }, [quote.id]);

  const checkExistingInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, document_type, status, total_amount, invoice_number, created_at')
        .eq('quote_request_id', quote.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setExistingInvoice({
          ...data,
          document_type: (data.document_type === 'invoice' ? 'invoice' : 'estimate') as 'estimate' | 'invoice'
        });
      }
    } catch (error) {
      console.error('Error checking existing invoice:', error);
    }
  };

  const handleCreateEstimate = async () => {
    setLoading(true);
    try {
      // Update quote with estimated total first
      if (estimatedPrice !== quote.estimated_total) {
        await supabase
          .from('quote_requests')
          .update({ 
            estimated_total: estimatedPrice,
            status: 'reviewed' 
          })
          .eq('id', quote.id);
      }

      // Navigate to estimate creation
      navigate(`/admin/estimate/quote/${quote.id}`);
    } catch (error) {
      console.error('Error preparing estimate:', error);
      toast({
        title: "Error",
        description: "Failed to prepare estimate",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewEstimate = () => {
    if (existingInvoice) {
      navigate(`/admin/estimate/${existingInvoice.id}`);
    }
  };

  const handleSendEstimate = async () => {
    if (!existingInvoice) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-invoice-email', {
        body: {
          invoice_id: existingInvoice.id,
          custom_subject: `Your Estimate - ${quote.event_name}`,
          custom_message: `Dear ${quote.contact_name},\n\nThank you for considering Soul Train's Eatery for your upcoming ${quote.event_name}. Please review the attached estimate.\n\nBest regards,\nSoul Train's Eatery Team`
        }
      });

      if (error) throw error;

      toast({
        title: "Estimate sent!",
        description: "The estimate has been emailed to the customer",
      });

      await checkExistingInvoice();
      onRefresh?.();
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
    if (!existingInvoice) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          invoice_id: existingInvoice.id,
          amount: existingInvoice.total_amount,
          customer_email: quote.email,
          description: `Payment for ${quote.event_name}`
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary' as const, label: 'New Request', icon: Clock };
      case 'reviewed':
        return { variant: 'default' as const, label: 'Reviewed', icon: Eye };
      case 'quoted':
        return { variant: 'default' as const, label: 'Estimate Ready', icon: FileText };
      case 'sent':
        return { variant: 'default' as const, label: 'Sent to Customer', icon: Send };
      case 'approved':
        return { variant: 'default' as const, label: 'Customer Approved', icon: CheckCircle2 };
      case 'paid':
        return { variant: 'default' as const, label: 'Payment Received', icon: DollarSign };
      default:
        return { variant: 'secondary' as const, label: status, icon: Clock };
    }
  };

  const getNextAction = () => {
    if (!existingInvoice) {
      return {
        label: 'Create Estimate',
        action: handleCreateEstimate,
        variant: 'default' as const,
        icon: FileText
      };
    }

    switch (existingInvoice.status) {
      case 'draft':
        return {
          label: 'Send to Customer',
          action: handleSendEstimate,
          variant: 'default' as const,
          icon: Send
        };
      case 'sent':
      case 'viewed':
        return {
          label: 'Create Payment Link',
          action: handleCreatePaymentLink,
          variant: 'default' as const,
          icon: DollarSign
        };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge(existingInvoice?.status || quote.status);
  const StatusIcon = statusBadge.icon;
  const nextAction = getNextAction();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg">{quote.event_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {quote.contact_name} • {new Date(quote.event_date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={statusBadge.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {existingInvoice && (
              <Button variant="outline" size="sm" onClick={handleViewEstimate}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {nextAction && (
              <Button 
                size="sm" 
                onClick={nextAction.action}
                disabled={loading}
                variant={nextAction.variant}
              >
                <nextAction.icon className="h-4 w-4 mr-2" />
                {nextAction.label}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(quote.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{quote.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{quote.guest_count} guests</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{quote.contact_name}</span>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {quote.email}
            </div>
            <div className="text-sm text-muted-foreground">
              {quote.phone}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            {!existingInvoice ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Total</label>
                <Input
                  type="number"
                  value={estimatedPrice / 100}
                  onChange={(e) => setEstimatedPrice(Math.round(parseFloat(e.target.value || '0') * 100))}
                  placeholder="Enter estimate"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-lg font-semibold text-primary">
                  ${(existingInvoice.total_amount / 100).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {existingInvoice.document_type === 'estimate' ? 'Estimate' : 'Invoice'} #{existingInvoice.invoice_number || existingInvoice.id.slice(0, 8)}
                </div>
              </div>
            )}
          </div>
        </div>

        {quote.special_requests && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="text-sm font-medium mb-1">Special Requests</div>
            <div className="text-sm text-muted-foreground">{quote.special_requests}</div>
          </div>
        )}
      </CardContent>

      {/* Preview Modal */}
      {showPreviewModal && existingInvoice && (
        <EstimatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          estimate={{
            id: existingInvoice.id,
            invoice_number: existingInvoice.invoice_number || `EST-${existingInvoice.id.slice(0, 8)}`,
            status: existingInvoice.status,
            total_amount: existingInvoice.total_amount,
            customer_name: quote.contact_name,
            customer_email: quote.email,
            event_details: {
              name: quote.event_name,
              date: quote.event_date,
              location: quote.location,
              guest_count: quote.guest_count
            },
            line_items: []
          }}
          quote={quote}
          onEmailSent={() => {
            setShowPreviewModal(false);
            checkExistingInvoice();
            onRefresh?.();
          }}
        />
      )}
    </Card>
  );
}