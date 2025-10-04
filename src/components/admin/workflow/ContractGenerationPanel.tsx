import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send, Eye, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ContractGenerationPanelProps {
  quote: any;
  invoice: any;
  isGovernmentContract: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function ContractGenerationPanel({
  quote,
  invoice,
  isGovernmentContract,
  onBack,
  onContinue
}: ContractGenerationPanelProps) {
  const [contractType, setContractType] = useState<string>('standard');
  const [contract, setContract] = useState<any>(null);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isGovernmentContract) {
      setContractType('government');
    } else if (quote.event_type === 'wedding' || quote.event_type === 'second_wedding') {
      setContractType('wedding');
    }
  }, [isGovernmentContract, quote.event_type]);

  useEffect(() => {
    checkExistingContract();
  }, [invoice?.id]);

  const checkExistingContract = async () => {
    if (!invoice?.id) return;

    try {
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('invoice_id', invoice.id)
        .single();

      if (data) {
        setContract(data);
      }
    } catch (error) {
      console.error('Error checking contract:', error);
    }
  };

  const generateContract = async () => {
    setLoading(true);
    try {
      // Generate contract in database
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          invoice_id: invoice.id,
          contract_type: contractType,
          status: 'generated',
          contract_html: generateContractHTML()
        })
        .select()
        .single();

      if (error) throw error;

      setContract(data);

      toast({
        title: 'Contract Generated',
        description: 'Contract has been generated successfully'
      });
    } catch (error: any) {
      console.error('Error generating contract:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate contract',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateContractHTML = () => {
    const eventDate = format(new Date(quote.event_date), 'MMMM dd, yyyy');
    const amount = (invoice.total_amount / 100).toFixed(2);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <h1 style="text-align: center; color: #333;">Catering Services Agreement</h1>
        <p style="text-align: center; color: #666; margin-bottom: 40px;">${contractType === 'wedding' ? 'Wedding Event' : contractType === 'government' ? 'Government Contract' : 'Catering Services'}</p>
        
        <h2>Event Details</h2>
        <p><strong>Event Name:</strong> ${quote.event_name}</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p><strong>Guest Count:</strong> ${quote.guest_count}</p>
        <p><strong>Location:</strong> ${quote.location}</p>
        
        <h2>Client Information</h2>
        <p><strong>Name:</strong> ${quote.contact_name}</p>
        <p><strong>Email:</strong> ${quote.email}</p>
        <p><strong>Phone:</strong> ${quote.phone}</p>
        
        <h2>Service Agreement</h2>
        <p>Soul Train's Eatery agrees to provide catering services for the above event in accordance with the terms outlined in this agreement.</p>
        
        <h3>Total Investment</h3>
        <p style="font-size: 20px; font-weight: bold;">$${amount}</p>
        
        ${contractType === 'government' ? `
          <h3>Government Contract Terms</h3>
          <p>Payment Terms: Net-30 from invoice date</p>
          <p>PO Number: ${quote.po_number || 'To be provided'}</p>
        ` : `
          <h3>Payment Terms</h3>
          <p>Deposit: 50% due upon contract signing</p>
          <p>Final Payment: Due 14 days before event date</p>
        `}
        
        ${customNotes ? `
          <h3>Special Notes</h3>
          <p>${customNotes}</p>
        ` : ''}
        
        <div style="margin-top: 60px;">
          <p>By signing below, you agree to the terms and conditions of this catering agreement.</p>
          <div style="margin-top: 40px; border-top: 1px solid #000; padding-top: 10px;">
            <p><strong>Client Signature</strong> _________________ <strong>Date</strong> _________</p>
          </div>
        </div>
      </div>
    `;
  };

  const sendContract = async () => {
    setLoading(true);
    try {
      // Update contract status
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'sent' })
        .eq('id', contract.id);

      if (error) throw error;

      // Send email with contract
      const { error: emailError } = await supabase.functions.invoke('send-workflow-email', {
        body: {
          quoteId: quote.id,
          invoiceId: invoice.id,
          emailType: 'contract',
          contractId: contract.id
        }
      });

      if (emailError) throw emailError;

      toast({
        title: 'Contract Sent',
        description: 'Contract has been sent to customer for signature'
      });

      setContract({ ...contract, status: 'sent' });
    } catch (error: any) {
      console.error('Error sending contract:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send contract',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      generated: { color: 'bg-blue-500', icon: FileText },
      sent: { color: 'bg-amber-500', icon: Send },
      viewed: { color: 'bg-purple-500', icon: Eye },
      signed: { color: 'bg-green-500', icon: CheckCircle2 }
    };

    const config = variants[status] || variants.generated;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Generation
            </div>
            {contract && getStatusBadge(contract.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contract Type Selection */}
          {!contract && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contract Type</label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Catering Agreement</SelectItem>
                    <SelectItem value="wedding">Wedding Event Agreement</SelectItem>
                    <SelectItem value="government">Government Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Special Notes (Optional)</label>
                <Textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Add any special terms or conditions..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Contract Preview */}
          {contract && (
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contract.contract_html }} />
            </div>
          )}

          {/* Event Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Event</p>
              <p className="font-medium">{quote.event_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(quote.event_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{quote.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium">${(invoice.total_amount / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            
            {!contract ? (
              <Button onClick={generateContract} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Contract
              </Button>
            ) : contract.status === 'generated' ? (
              <Button onClick={sendContract} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </Button>
            ) : contract.status === 'signed' ? (
              <Button onClick={onContinue}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Continue to Payment
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Waiting for Signature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
