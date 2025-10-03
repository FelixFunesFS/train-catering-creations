import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ContractSigning() {
  const { contractId, accessToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select(`
          *,
          invoices!inner(
            customer_access_token,
            quote_requests!inner(contact_name, email)
          )
        `)
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;

      // Verify access token
      const invoice = contractData.invoices as any;
      if (invoice.customer_access_token !== accessToken) {
        setError("Invalid access token. Please use the link from your email.");
        return;
      }

      // Check if already signed
      if (contractData.status === 'signed') {
        setError("This contract has already been signed.");
        return;
      }

      setContract(contractData);
      setSignerName(invoice.quote_requests.contact_name || "");
      
    } catch (err: any) {
      console.error('Error fetching contract:', err);
      setError(err.message || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms before signing",
        variant: "destructive"
      });
      return;
    }

    if (!signerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to sign",
        variant: "destructive"
      });
      return;
    }

    try {
      setSigning(true);

      // Update contract status
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_by: signerName,
          signed_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (updateError) throw updateError;

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          contract_signed_at: new Date().toISOString()
        })
        .eq('id', contract.invoice_id);

      if (invoiceError) throw invoiceError;

      // Send confirmation email
      const invoice = contract.invoices as any;
      await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: invoice.quote_requests.email,
          subject: 'Contract Signed - Soul Train\'s Eatery',
          html: `
            <h2>Contract Signed Successfully</h2>
            <p>Dear ${signerName},</p>
            <p>Thank you for signing the catering service contract with Soul Train's Eatery!</p>
            <p>We've received your signed contract and are excited to serve you.</p>
            <p>If you have any questions, please don't hesitate to contact us:</p>
            <ul>
              <li>Phone: (843) 970-0265</li>
              <li>Email: soultrainseatery@gmail.com</li>
            </ul>
            <p>Thank you,<br>Soul Train's Eatery Team</p>
          `
        }
      });

      toast({
        title: "Contract Signed!",
        description: "Thank you! A confirmation email has been sent."
      });

      setTimeout(() => navigate('/'), 3000);

    } catch (err: any) {
      console.error('Error signing contract:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to sign contract",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2">Contract Signature Required</h1>
          <p className="text-muted-foreground">Please review the contract below and sign to proceed.</p>
        </Card>

        {/* Contract Display */}
        <Card className="p-6">
          <div 
            className="prose max-w-none bg-muted p-6 rounded-lg max-h-[60vh] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: contract?.contract_html || '' }}
          />
        </Card>

        {/* Signature Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sign Contract</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="signerName">Full Name (Electronic Signature)</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the terms and conditions outlined in this catering service contract. 
                By typing my name above, I acknowledge that this constitutes a legally binding electronic signature.
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSign}
                disabled={!agreed || !signerName.trim() || signing}
                className="flex-1"
              >
                {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Contract
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={signing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted">
          <p className="text-sm text-muted-foreground text-center">
            Questions? Contact us at (843) 970-0265 or soultrainseatery@gmail.com
          </p>
        </Card>
      </div>
    </div>
  );
}
