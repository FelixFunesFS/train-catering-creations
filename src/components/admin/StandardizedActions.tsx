import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  FileText, 
  Send, 
  CreditCard, 
  CheckCircle,
  Edit
} from 'lucide-react';

interface StandardizedActionsProps {
  type: 'quote' | 'invoice';
  item: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onRefresh?: () => void;
}

export function StandardizedActions({ 
  type, 
  item, 
  variant = 'outline', 
  size = 'sm',
  onRefresh 
}: StandardizedActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewQuote = () => {
    navigate(`/admin/quotes/${item.id}`);
  };

  const handleViewEstimate = () => {
    // Open estimate preview modal or navigate to estimate page
    navigate(`/estimate-preview/${item.id}`);
  };

  const handleCreateInvoice = async () => {
    try {
      await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: item.id }
      });
      
      toast({
        title: "Invoice Created",
        description: "Invoice has been generated from the quote",
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async () => {
    try {
      await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: item.id }
      });
      
      toast({
        title: "Invoice Sent",
        description: `Invoice sent to ${item.customers?.email || item.email}`,
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePaymentLink = async () => {
    try {
      const { data } = await supabase.functions.invoke('create-payment-link', {
        body: { 
          invoice_id: item.id,
          amount: item.total_amount 
        }
      });
      
      if (data?.url) {
        navigator.clipboard.writeText(data.url);
        toast({
          title: "Payment Link Created",
          description: "Link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkReviewed = async () => {
    try {
      await supabase
        .from('quote_requests')
        .update({ status: 'reviewed' })
        .eq('id', item.id);
      
      toast({
        title: "Quote Reviewed",
        description: `Quote for ${item.event_name} has been marked as reviewed`,
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (type === 'quote') {
    return (
      <div className="flex gap-1">
        <Button
          size={size}
          variant={variant}
          onClick={handleViewQuote}
          title="View Quote Details"
        >
          <Eye className="h-3 w-3" />
          {size !== 'sm' && <span className="ml-2">View Quote</span>}
        </Button>
        
        {(item.status === 'pending' || item.workflow_status === 'pending') && (
          <Button
            size={size}
            onClick={handleMarkReviewed}
            title="Mark as Reviewed"
          >
            <CheckCircle className="h-3 w-3" />
            {size !== 'sm' && <span className="ml-2">Review</span>}
          </Button>
        )}
        
        {(item.status === 'reviewed' || item.workflow_status === 'under_review') && (
          <Button
            size={size}
            onClick={handleCreateInvoice}
            title="Create Invoice"
          >
            <FileText className="h-3 w-3" />
            {size !== 'sm' && <span className="ml-2">Create Invoice</span>}
          </Button>
        )}
      </div>
    );
  }

  if (type === 'invoice') {
    return (
      <div className="flex gap-1">
        <Button
          size={size}
          variant={variant}
          onClick={handleViewEstimate}
          title="View Estimate"
        >
          <Eye className="h-3 w-3" />
          {size !== 'sm' && <span className="ml-2">View Estimate</span>}
        </Button>
        
        {!item.is_draft && (
          <>
            <Button
              size={size}
              variant={variant}
              onClick={handleSendInvoice}
              title="Send Invoice"
            >
              <Send className="h-3 w-3" />
              {size !== 'sm' && <span className="ml-2">Send</span>}
            </Button>
            
            <Button
              size={size}
              variant={variant}
              onClick={handleCreatePaymentLink}
              title="Create Payment Link"
            >
              <CreditCard className="h-3 w-3" />
              {size !== 'sm' && <span className="ml-2">Payment Link</span>}
            </Button>
          </>
        )}
        
        {item.is_draft && (
          <Button
            size={size}
            variant={variant}
            onClick={() => navigate(`/admin/invoice-creation/${item.quote_request_id || item.id}`)}
            title="Edit Draft"
          >
            <Edit className="h-3 w-3" />
            {size !== 'sm' && <span className="ml-2">Edit</span>}
          </Button>
        )}
      </div>
    );
  }

  return null;
}

// Helper component for consistent action buttons
interface ActionButtonProps {
  action: 'view-quote' | 'view-estimate' | 'create-invoice' | 'send-invoice' | 'payment-link' | 'mark-reviewed';
  item: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onRefresh?: () => void;
  children?: React.ReactNode;
}

export function ActionButton({ 
  action, 
  item, 
  variant = 'outline', 
  size = 'sm', 
  onRefresh,
  children 
}: ActionButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      switch (action) {
        case 'view-quote':
          navigate(`/admin/quotes/${item.id}`);
          break;
          
        case 'view-estimate':
          navigate(`/estimate-preview/${item.id}`);
          break;
          
        case 'create-invoice':
          await supabase.functions.invoke('generate-invoice-from-quote', {
            body: { quote_request_id: item.id }
          });
          toast({
            title: "Invoice Created",
            description: "Invoice has been generated from the quote",
          });
          onRefresh?.();
          break;
          
        case 'send-invoice':
          await supabase.functions.invoke('send-invoice-email', {
            body: { invoice_id: item.id }
          });
          toast({
            title: "Invoice Sent",
            description: `Invoice sent successfully`,
          });
          onRefresh?.();
          break;
          
        case 'payment-link':
          const { data } = await supabase.functions.invoke('create-payment-link', {
            body: { 
              invoice_id: item.id,
              amount: item.total_amount 
            }
          });
          if (data?.url) {
            navigator.clipboard.writeText(data.url);
            toast({
              title: "Payment Link Created",
              description: "Link copied to clipboard",
            });
          }
          break;
          
        case 'mark-reviewed':
          await supabase
            .from('quote_requests')
            .update({ status: 'reviewed' })
            .eq('id', item.id);
          toast({
            title: "Quote Reviewed",
            description: `Quote has been marked as reviewed`,
          });
          onRefresh?.();
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}