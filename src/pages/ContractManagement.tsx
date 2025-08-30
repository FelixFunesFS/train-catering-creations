import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Edit, 
  Eye,
  Calendar,
  User,
  Building,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Contract {
  id: string;
  invoice_id: string;
  contract_type: string;
  status: string;
  contract_html?: string;
  generated_at: string;
  signed_at: string | null;
  signed_by: string | null;
  created_at: string;
  invoices: {
    invoice_number: string;
    customers: {
      name: string;
      email: string;
    };
    quote_requests: {
      event_name: string;
      event_date: string;
    };
  };
}

export default function ContractManagement() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          invoices (
            invoice_number,
            customers (
              name,
              email
            ),
            quote_requests (
              event_name,
              event_date
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async (invoiceId: string, contractType: string = 'standard') => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: { 
          invoice_id: invoiceId,
          contract_type: contractType
        }
      });

      if (error) throw error;

      toast({
        title: "Contract Generated",
        description: "Service agreement has been generated successfully",
      });

      fetchContracts();
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate contract",
        variant: "destructive"
      });
    }
  };

  const handleDownloadContract = (contract: Contract) => {
    // In a real implementation, this would download the actual contract PDF
    // For now, we'll show the HTML content in a new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(contract.contract_html || '<p>Contract content not available</p>');
      newWindow.document.close();
    }
  };

  const handleMarkSigned = async (contractId: string, signerName: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signed_by: signerName
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Contract Signed",
        description: "Contract has been marked as signed",
      });

      fetchContracts();
    } catch (error) {
      console.error('Error marking contract as signed:', error);
      toast({
        title: "Error",
        description: "Failed to update contract status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'sent': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'signed': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'expired': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contract Management</h1>
          <p className="text-muted-foreground">
            Manage service agreements and contracts
          </p>
        </div>
        <Button onClick={fetchContracts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{contracts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generated</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'generated').length}</p>
              </div>
              <Edit className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signed</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'signed').length}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Government</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.contract_type === 'government').length}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contract.invoices.invoice_number}</h4>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                        {contract.contract_type === 'government' && (
                          <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                            <Building className="h-3 w-3 mr-1" />
                            Government
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {contract.invoices.customers.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(contract.invoices.quote_requests.event_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Generated {formatDate(contract.generated_at)}
                      </div>
                      {contract.signed_at && (
                        <div className="text-sm text-green-600">
                          Signed {formatDate(contract.signed_at)}
                          {contract.signed_by && ` by ${contract.signed_by}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium">{contract.invoices.quote_requests.event_name}</p>
                    <p className="text-xs text-muted-foreground">{contract.invoices.customers.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadContract(contract)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Contract
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadContract(contract)}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    {contract.status === 'generated' && (
                      <Button size="sm" onClick={() => handleMarkSigned(contract.id, contract.invoices.customers.name)}>
                        <User className="h-3 w-3 mr-1" />
                        Mark Signed
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contracts found</p>
                <p className="text-sm text-muted-foreground">Contracts will appear here once generated from approved estimates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}