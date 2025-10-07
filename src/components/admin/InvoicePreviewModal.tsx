import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvoiceViewer } from '@/components/admin/invoice/InvoiceViewer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Send, 
  CreditCard, 
  MessageSquare,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onRefresh?: () => void;
}

export function InvoicePreviewModal({ isOpen, onClose, invoice, onRefresh }: InvoicePreviewModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  if (!invoice) return null;

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      if (data?.html_content) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.html_content);
          newWindow.document.close();
          newWindow.focus();
          setTimeout(() => newWindow.print(), 500);
        }

        toast({
          title: "PDF Ready",
          description: "Estimate opened in new window for printing/saving.",
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Estimate has been emailed to the customer",
      });

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { 
          invoice_id: invoice.id,
          amount: invoice.total_amount 
        }
      });

      if (error) throw error;

      if (data?.url) {
        navigator.clipboard.writeText(data.url);
        toast({
          title: "Payment Link Created",
          description: `Link copied to clipboard: ${data.url}`,
        });
        
        const confirmed = window.confirm(
          `Payment link created!\n\n${data.url}\n\nCopied to clipboard. Open in new tab?`
        );
        
        if (confirmed) {
          window.open(data.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullscreen = () => {
    window.open(`/estimate-preview/${invoice.id}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string, isDraft: boolean) => {
    if (isDraft) return 'default';
    switch (status) {
      case 'sent': return 'default';
      case 'viewed': return 'secondary';
      case 'approved': return 'default';
      case 'contract_sent': return 'secondary';
      case 'deposit_paid': return 'default';
      case 'confirmed': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>
                {invoice.invoice_number || 'Draft Estimate'}
              </DialogTitle>
              <Badge variant={getStatusColor(invoice.workflow_status, invoice.is_draft)}>
                {invoice.is_draft ? 'Draft' : invoice.workflow_status?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewFullscreen}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="font-semibold">
                {invoice.event_date ? 
                  new Date(invoice.event_date).toLocaleDateString() : 
                  'Not set'
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{invoice.customer_name || 'N/A'}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Preview</h3>
              <p className="text-muted-foreground">
                Full invoice preview would be rendered here using the InvoiceViewer component.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>

            {!invoice.is_draft && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendEmail}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Email Customer
                </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleCreatePaymentLink}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
              </>
            )}

            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
