import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';

interface UseEstimateActionsProps {
  quoteId: string | undefined;
  invoiceId: string | undefined;
  invoiceNumber?: string;
  onClose?: () => void;
}

interface UseEstimateActionsReturn {
  // Generation
  handleGenerateEstimate: () => Promise<void>;
  isGenerating: boolean;
  
  // Sending
  handleSendEstimate: (overrideEmail?: string, isResendMode?: boolean) => Promise<void>;
  isSending: boolean;
  
  // PDF
  handleDownloadPdf: () => Promise<void>;
  isDownloading: boolean;
  
  // Discounts
  handleApplyDiscount: (amount: number, type: 'percentage' | 'fixed', description: string) => Promise<void>;
  handleRemoveDiscount: () => Promise<void>;
  
  // Government toggle
  handleToggleGovernment: (checked: boolean) => Promise<void>;
  
  // Milestones
  handleRegenerateMilestones: () => Promise<void>;
  isRegenerating: boolean;
  
  // Event completion
  handleMarkEventCompleted: () => Promise<void>;
  isMarkingComplete: boolean;
}

export function useEstimateActions({
  quoteId,
  invoiceId,
  invoiceNumber,
  onClose,
}: UseEstimateActionsProps): UseEstimateActionsReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateInvoice = useUpdateInvoice();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Generate estimate from quote
  const handleGenerateEstimate = useCallback(async () => {
    if (!quoteId) return;
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quoteId }
      });
      if (error) throw error;

      toast({ title: 'Estimate Generated', description: 'Line items created successfully.' });
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-by-quote', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['line-items'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [quoteId, toast, queryClient]);

  // Regenerate payment milestones
  const handleRegenerateMilestones = useCallback(async () => {
    if (!invoiceId) return;
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-payment-milestones', {
        body: { invoice_id: invoiceId, force_regenerate: true }
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-with-milestones', invoiceId] });
      toast({ title: 'Payment schedule regenerated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
    }
  }, [invoiceId, queryClient, toast]);

  // Toggle government contract status
  const handleToggleGovernment = useCallback(async (checked: boolean) => {
    if (!quoteId) return;
    
    try {
      // 1. Update quote's compliance level
      const { error } = await supabase
        .from('quote_requests')
        .update({ 
          compliance_level: checked ? 'government' : 'standard',
          requires_po_number: checked,
        })
        .eq('id', quoteId);
        
      if (error) throw error;
      
      // 2. Force recalculate invoice totals (single source of truth)
      if (invoiceId) {
        const { error: rpcError } = await supabase.rpc('force_recalculate_invoice_totals', {
          p_invoice_id: invoiceId
        });
        if (rpcError) {
          console.error('RPC error:', rpcError);
        }
      }
      
      // 3. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      toast({ 
        title: checked ? 'Government Contract Enabled' : 'Government Contract Disabled',
        description: checked ? 'Tax exemption and Net 30 terms applied.' : 'Standard payment terms applied.',
      });
      
      // 4. Regenerate milestones with new government status
      await handleRegenerateMilestones();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [quoteId, invoiceId, queryClient, toast, handleRegenerateMilestones]);

  // Send estimate email
  const handleSendEstimate = useCallback(async (overrideEmail?: string, isResendMode: boolean = false) => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-customer-portal-email', {
        body: { type: 'estimate_ready', quote_request_id: quoteId, override_email: overrideEmail },
      });
      if (error) throw error;

      if (!isResendMode && invoiceId) {
        await supabase.from('invoices').update({
          workflow_status: 'sent',
          sent_at: new Date().toISOString(),
          is_draft: false,
        }).eq('id', invoiceId);
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: isResendMode ? 'Estimate Resent' : 'Estimate Sent' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  }, [quoteId, invoiceId, queryClient, toast]);

  // Download PDF
  const handleDownloadPdf = useCallback(async () => {
    if (!invoiceId) {
      toast({ title: 'No estimate available', description: 'Generate an estimate first.', variant: 'destructive' });
      return;
    }
    setIsDownloading(true);
    try {
      toast({ title: 'Generating PDF...', description: 'Please wait' });
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoiceId }
      });
      if (error) throw error;
      if (!data?.pdf_base64) throw new Error('No PDF generated');
      
      const binaryString = atob(data.pdf_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${invoiceNumber || 'draft'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'PDF Downloaded' });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast({ title: 'PDF Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  }, [invoiceId, invoiceNumber, toast]);

  // Apply discount
  const handleApplyDiscount = useCallback(async (amount: number, type: 'percentage' | 'fixed', description: string) => {
    if (!invoiceId) return;
    await updateInvoice.mutateAsync({
      invoiceId,
      updates: { discount_amount: amount, discount_type: type, discount_description: description } as any,
    });
  }, [updateInvoice, invoiceId]);

  // Remove discount
  const handleRemoveDiscount = useCallback(async () => {
    if (!invoiceId) return;
    await updateInvoice.mutateAsync({
      invoiceId,
      updates: { discount_amount: 0, discount_type: null, discount_description: null } as any,
    });
  }, [updateInvoice, invoiceId]);

  // Mark event as completed
  const handleMarkEventCompleted = useCallback(async () => {
    if (!quoteId || !invoiceId) return;
    setIsMarkingComplete(true);
    try {
      // Update quote status to completed
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'completed',
          last_status_change: new Date().toISOString(),
          status_changed_by: 'admin',
        })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;
      
      // Update invoice to paid/completed if not already
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          workflow_status: 'paid',
          paid_at: new Date().toISOString(),
          last_status_change: new Date().toISOString(),
          status_changed_by: 'admin',
        })
        .eq('id', invoiceId);
      
      if (invoiceError) throw invoiceError;
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({ 
        title: 'Event Marked Complete', 
        description: 'The event has been successfully marked as completed.' 
      });
      
      // Optionally close the panel
      onClose?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsMarkingComplete(false);
    }
  }, [quoteId, invoiceId, queryClient, toast, onClose]);

  return {
    handleGenerateEstimate,
    isGenerating,
    handleSendEstimate,
    isSending,
    handleDownloadPdf,
    isDownloading,
    handleApplyDiscount,
    handleRemoveDiscount,
    handleToggleGovernment,
    handleRegenerateMilestones,
    isRegenerating,
    handleMarkEventCompleted,
    isMarkingComplete,
  };
}
