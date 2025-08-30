import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Upload, 
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'estimate' | 'invoice' | 'contract' | 'receipt' | 'other';
  status: 'draft' | 'sent' | 'signed' | 'completed';
  created_at: string;
  file_url?: string;
  related_quote_id?: string;
  related_invoice_id?: string;
  file_size?: number;
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, statusFilter, typeFilter]);

  const fetchDocuments = async () => {
    try {
      // Fetch invoices (these are our primary documents)
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total_amount,
          created_at,
          pdf_url,
          is_draft,
          quote_requests!quote_request_id(event_name, contact_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform invoices into document format
      const invoiceDocs: Document[] = (invoices || []).map(invoice => ({
        id: invoice.id,
        name: invoice.invoice_number || `Invoice - ${invoice.quote_requests?.event_name}`,
        type: invoice.is_draft ? 'estimate' : 'invoice',
        status: invoice.status === 'draft' ? 'draft' : 
                invoice.status === 'sent' ? 'sent' : 
                invoice.status === 'paid' ? 'completed' : 'sent',
        created_at: invoice.created_at,
        file_url: invoice.pdf_url,
        related_invoice_id: invoice.id,
        file_size: Math.floor(Math.random() * 500) + 100 // Mock file size
      }));

      // Fetch contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select(`
          id,
          contract_type,
          status,
          created_at,
          invoice_id,
          signed_at,
          invoices!invoice_id(quote_requests!quote_request_id(event_name, contact_name))
        `)
        .order('created_at', { ascending: false });

      const contractDocs: Document[] = (contracts || []).map(contract => ({
        id: contract.id,
        name: `${contract.contract_type} Contract - ${contract.invoices?.quote_requests?.event_name}`,
        type: 'contract',
        status: contract.status === 'signed' ? 'signed' : 
                contract.status === 'generated' ? 'sent' : 'draft',
        created_at: contract.created_at,
        related_invoice_id: contract.invoice_id,
        file_size: Math.floor(Math.random() * 300) + 50
      }));

      setDocuments([...invoiceDocs, ...contractDocs]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    setFilteredDocs(filtered);
  };

  const generateDocument = async (type: 'estimate' | 'invoice' | 'contract', quoteId?: string) => {
    try {
      let response;
      
      if (type === 'estimate' || type === 'invoice') {
        // Generate estimate/invoice PDF
        response = await supabase.functions.invoke('generate-pdf-document', {
          body: { type, quoteId }
        });
      } else if (type === 'contract') {
        // Generate contract
        response = await supabase.functions.invoke('generate-contract', {
          body: { quoteId }
        });
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully`
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${type}`,
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (doc: Document) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      toast({
        title: "Not Available",
        description: "Document file is not available for download",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'signed': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'estimate': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'invoice': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'contract': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'receipt': return <FileText className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-muted-foreground">Manage estimates, invoices, contracts, and receipts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateDocument('estimate')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
          <Button onClick={() => generateDocument('contract')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="estimate">Estimates</option>
              <option value="invoice">Invoices</option>
              <option value="contract">Contracts</option>
              <option value="receipt">Receipts</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">No documents match your current filters.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(doc.type)}
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                        {doc.file_size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadgeVariant(doc.status)}>
                      {doc.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        disabled={!doc.file_url}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        disabled={!doc.file_url}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}