import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building, 
  CheckCircle, 
  FileText, 
  AlertTriangle,
  Clock,
  Send,
  Download,
  Plus
} from 'lucide-react';

interface GovernmentContract {
  id: string;
  quote_request_id: string;
  contract_status: string;
  compliance_checklist: any;
  compliance_documentation: any;
  required_documents: string[];
  special_requirements: any;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  quote_requests: {
    contact_name: string;
    email: string;
    event_name: string;
    event_date: string;
    location: string;
    guest_count: number;
    estimated_total: number;
  };
}

interface GovernmentContractFormProps {
  quoteRequestId?: string;
  onClose?: () => void;
}

export default function GovernmentContractForm({ quoteRequestId, onClose }: GovernmentContractFormProps) {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<GovernmentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<GovernmentContract | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGovernmentContracts();
  }, []);

  const fetchGovernmentContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('government_contracts')
        .select(`
          *,
          quote_requests (
            contact_name,
            email,
            event_name,
            event_date,
            location,
            guest_count,
            estimated_total
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching government contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load government contracts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateGovernmentContract = async (quoteId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('government-contract-workflow', {
        body: { 
          quote_request_id: quoteId,
          action: 'initialize'
        }
      });

      if (error) throw error;

      toast({
        title: "Government Contract Initiated",
        description: "Government contract workflow has been started",
      });

      fetchGovernmentContracts();
    } catch (error) {
      console.error('Error initiating government contract:', error);
      toast({
        title: "Error",
        description: "Failed to initiate government contract",
        variant: "destructive"
      });
    }
  };

  const handleGenerateComplianceDocs = async (contract: GovernmentContract) => {
    try {
      const { data, error } = await supabase.functions.invoke('government-contract-workflow', {
        body: { 
          quote_request_id: contract.quote_request_id,
          action: 'generate_compliance_docs'
        }
      });

      if (error) throw error;

      toast({
        title: "Compliance Documents Generated",
        description: "All required compliance documentation has been prepared",
      });

      fetchGovernmentContracts();
    } catch (error) {
      console.error('Error generating compliance docs:', error);
      toast({
        title: "Error",
        description: "Failed to generate compliance documents",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForApproval = async (contract: GovernmentContract) => {
    try {
      const { data, error } = await supabase.functions.invoke('government-contract-workflow', {
        body: { 
          quote_request_id: contract.quote_request_id,
          action: 'submit_for_approval'
        }
      });

      if (error) throw error;

      toast({
        title: "Submitted for Approval",
        description: "Government contract has been submitted for official approval",
      });

      fetchGovernmentContracts();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit for approval",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'compliance_ready': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'submitted_for_approval': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case 'approved': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'rejected': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated': return <Clock className="h-4 w-4" />;
      case 'compliance_ready': return <FileText className="h-4 w-4" />;
      case 'submitted_for_approval': return <Send className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading government contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold">Government Contracts</h2>
        </div>
        {quoteRequestId && (
          <Button onClick={() => handleInitiateGovernmentContract(quoteRequestId)}>
            <Plus className="h-4 w-4 mr-2" />
            Initiate Government Contract
          </Button>
        )}
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
              <Building className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => ['initiated', 'compliance_ready'].includes(c.contract_status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => c.contract_status === 'submitted_for_approval').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => c.contract_status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Government Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Government Contract Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contract.quote_requests.event_name}</h4>
                        <Badge className={getStatusColor(contract.contract_status)}>
                          {getStatusIcon(contract.contract_status)}
                          <span className="ml-1">{contract.contract_status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Contact:</strong> {contract.quote_requests.contact_name}</p>
                        <p><strong>Event Date:</strong> {formatDate(contract.quote_requests.event_date)}</p>
                        <p><strong>Location:</strong> {contract.quote_requests.location}</p>
                        <p><strong>Guests:</strong> {contract.quote_requests.guest_count}</p>
                        <p><strong>Estimated Value:</strong> {formatCurrency(contract.quote_requests.estimated_total || 0)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Created {formatDate(contract.created_at)}
                      </div>
                      {contract.submitted_at && (
                        <div className="text-sm text-purple-600">
                          Submitted {formatDate(contract.submitted_at)}
                        </div>
                      )}
                      {contract.approved_at && (
                        <div className="text-sm text-green-600">
                          Approved {formatDate(contract.approved_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  {contract.compliance_checklist && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Compliance Status</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(contract.compliance_checklist).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            {value ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> : 
                              <Clock className="h-3 w-3 text-yellow-500" />
                            }
                            <span className={value ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}>
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {contract.required_documents && contract.required_documents.length > 0 && (
                    <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Required Documents</h5>
                      <div className="space-y-1 text-sm">
                        {contract.required_documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-yellow-600" />
                            <span className="text-yellow-700 dark:text-yellow-300">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {contract.contract_status === 'initiated' && (
                      <Button size="sm" onClick={() => handleGenerateComplianceDocs(contract)}>
                        <FileText className="h-3 w-3 mr-1" />
                        Generate Compliance Docs
                      </Button>
                    )}

                    {contract.contract_status === 'compliance_ready' && (
                      <Button size="sm" onClick={() => handleSubmitForApproval(contract)}>
                        <Send className="h-3 w-3 mr-1" />
                        Submit for Approval
                      </Button>
                    )}

                    {contract.compliance_documentation && (
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download Documents
                      </Button>
                    )}

                    <Button size="sm" variant="outline" onClick={() => setSelectedContract(contract)}>
                      <FileText className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No government contracts found</p>
                <p className="text-sm text-muted-foreground">Government contracts will appear here once initiated</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Details Modal */}
      {selectedContract && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contract Details: {selectedContract.quote_requests.event_name}</span>
              <Button variant="outline" onClick={() => setSelectedContract(null)}>Close</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Special Requirements</Label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedContract.special_requirements, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedContract.compliance_documentation && (
                <div>
                  <Label className="text-sm font-medium">Compliance Documentation</Label>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedContract.compliance_documentation, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="contract-notes">Notes</Label>
                <Textarea
                  id="contract-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this government contract..."
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}