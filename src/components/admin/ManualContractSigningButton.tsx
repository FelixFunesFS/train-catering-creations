import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, FileSignature } from 'lucide-react';

interface ManualContractSigningButtonProps {
  contractId: string;
  invoiceId: string;
  customerName?: string;
  onSuccess?: () => void;
}

export function ManualContractSigningButton({ 
  contractId, 
  invoiceId, 
  customerName, 
  onSuccess 
}: ManualContractSigningButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signerName, setSignerName] = useState(customerName || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMarkAsSigned = async () => {
    if (!signerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the signer's name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update contract status
      const { error: contractError } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_by: signerName,
          signed_at: new Date().toISOString(),
          customer_signature_data: {
            method: 'manual',
            marked_by: 'admin',
            notes: notes,
          },
        })
        .eq('id', contractId);

      if (contractError) throw contractError;

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          contract_signed_at: new Date().toISOString(),
          workflow_status: 'approved', // Keep as approved, contract signed is tracked via contract_signed_at
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      toast({
        title: "Contract Marked as Signed",
        description: "The contract has been successfully marked as signed.",
      });

      onSuccess?.();
      setIsOpen(false);
      setSignerName('');
      setNotes('');
    } catch (error: any) {
      console.error('Error marking contract as signed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark contract as signed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <FileSignature className="h-4 w-4" />
        Mark as Signed (Manual)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Mark Contract as Signed
            </DialogTitle>
            <DialogDescription>
              Use this to manually record that a contract has been signed (e.g., wet signature, DocuSign, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signer">Signer Name *</Label>
              <Input
                id="signer"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter the name of the person who signed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes (e.g., 'Signed via DocuSign', 'Wet signature received')"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsSigned} disabled={loading} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {loading ? 'Marking as Signed...' : 'Mark as Signed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
