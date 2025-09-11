import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Send,
  Eye,
  Edit3
} from 'lucide-react';

interface Contract {
  id: string;
  invoice_id: string;
  contract_type: string;
  contract_html: string;
  status: string;
  generated_at: string;
  signed_at: string | null;
  signed_by: string | null;
}

interface ContractManagementProps {
  invoiceId: string;
  quoteRequest: any;
  onContractSigned?: () => void;
}

export function ContractManagement({ 
  invoiceId, 
  quoteRequest, 
  onContractSigned 
}: ContractManagementProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<string | null>(null);
  const [contractContent, setContractContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadContracts();
  }, [invoiceId]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewContract = async () => {
    try {
      setActionLoading('generate');

      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: {
          invoice_id: invoiceId,
          quote_request_id: quoteRequest.id,
          contract_type: 'standard',
          customer_data: {
            name: quoteRequest.contact_name,
            email: quoteRequest.email,
            phone: quoteRequest.phone,
            event_name: quoteRequest.event_name,
            event_date: quoteRequest.event_date,
            location: quoteRequest.location,
            guest_count: quoteRequest.guest_count
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Contract Generated",
        description: "New service contract has been generated successfully",
      });

      await loadContracts();
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate contract",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const sendContractToCustomer = async (contractId: string) => {
    try {
      setActionLoading(`send-${contractId}`);

      const { data, error } = await supabase.functions.invoke('send-contract-email', {
        body: {
          contract_id: contractId,
          customer_email: quoteRequest.email,
          customer_name: quoteRequest.contact_name,
          event_name: quoteRequest.event_name
        }
      });

      if (error) throw error;

      toast({
        title: "Contract Sent",
        description: "Contract has been sent to customer for signature",
      });

      await loadContracts();
    } catch (error) {
      console.error('Error sending contract:', error);
      toast({
        title: "Error",
        description: "Failed to send contract",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateContractContent = async (contractId: string) => {
    try {
      setActionLoading(`update-${contractId}`);

      const { error } = await supabase
        .from('contracts')
        .update({ 
          contract_html: contractContent,
          status: 'generated' // Reset status after edit
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Contract Updated",
        description: "Contract content has been updated successfully",
      });

      setEditingContract(null);
      setContractContent('');
      await loadContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: "Error",
        description: "Failed to update contract",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const downloadContract = (contract: Contract) => {
    const blob = new Blob([contract.contract_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${quoteRequest.event_name}-${contract.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewContract = (contract: Contract) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(contract.contract_html);
      newWindow.document.close();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'generated':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'signed':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'generated':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading contracts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestContract = contracts[0];
  const hasSignedContract = contracts.some(c => c.status === 'signed');

  return (
    <div className="space-y-6">
      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Contracts
            {hasSignedContract && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Signed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No contracts generated yet
              </p>
              <Button
                onClick={generateNewContract}
                disabled={actionLoading === 'generate'}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {actionLoading === 'generate' ? 'Generating...' : 'Generate Contract'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Latest Contract Status */}
              <Alert>
                <div className="flex items-center gap-2">
                  {getStatusIcon(latestContract.status)}
                  <AlertDescription>
                    Contract is {latestContract.status}
                    {latestContract.signed_at && (
                      <span className="ml-2">
                        - Signed on {new Date(latestContract.signed_at).toLocaleDateString()}
                        {latestContract.signed_by && ` by ${latestContract.signed_by}`}
                      </span>
                    )}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Contract Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => previewContract(latestContract)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadContract(latestContract)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>

                {latestContract.status === 'generated' && (
                  <Button
                    onClick={() => sendContractToCustomer(latestContract.id)}
                    disabled={actionLoading === `send-${latestContract.id}`}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {actionLoading === `send-${latestContract.id}` ? 'Sending...' : 'Send to Customer'}
                  </Button>
                )}

                {latestContract.status !== 'signed' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingContract(latestContract.id);
                      setContractContent(latestContract.contract_html);
                    }}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Contract
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={generateNewContract}
                  disabled={actionLoading === 'generate'}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {actionLoading === 'generate' ? 'Generating...' : 'Generate New Version'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract History */}
      {contracts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Contract History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(contract.status)}
                    <div>
                      <div className="font-medium">
                        Contract v{contracts.length - index}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Generated {new Date(contract.generated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(contract.status)}>
                      {contract.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => previewContract(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Editor */}
      {editingContract && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Contract Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="contract-content">Contract HTML Content</Label>
              <Textarea
                id="contract-content"
                value={contractContent}
                onChange={(e) => setContractContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Enter contract HTML content..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => updateContractContent(editingContract)}
                  disabled={actionLoading === `update-${editingContract}`}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {actionLoading === `update-${editingContract}` ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingContract(null);
                    setContractContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}