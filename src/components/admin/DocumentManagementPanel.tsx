import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  FileCheck
} from 'lucide-react';
import { format } from 'date-fns';

interface EventDocument {
  id: string;
  quote_request_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  document_category: string;
  version: number;
  is_customer_visible: boolean;
  uploaded_by: string;
  notes: string | null;
  created_at: string;
  quote_request?: {
    event_name: string;
    contact_name: string;
  };
}

const DOCUMENT_CATEGORIES = [
  { value: 'contract', label: 'Contract' },
  { value: 'menu', label: 'Menu' },
  { value: 'floor_plan', label: 'Floor Plan' },
  { value: 'license', label: 'License' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'other', label: 'Other' }
];

export function DocumentManagementPanel() {
  const [documents, setDocuments] = useState<EventDocument[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Upload form state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('other');
  const [documentNotes, setDocumentNotes] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchDocuments();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('id, event_name, contact_name, event_date')
      .order('event_date', { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_documents')
      .select(`
        *,
        quote_request:quote_requests(event_name, contact_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data as EventDocument[]);
    }
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedEventId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file and an event',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const filePath = `${selectedEventId}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('event-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create metadata record
      const { error: dbError } = await supabase
        .from('event_documents')
        .insert({
          quote_request_id: selectedEventId,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          document_category: documentCategory,
          is_customer_visible: isCustomerVisible,
          notes: documentNotes || null
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      });

      // Reset form
      setSelectedFile(null);
      setSelectedEventId('');
      setDocumentCategory('other');
      setDocumentNotes('');
      setIsCustomerVisible(false);
      
      // Refresh documents
      fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: EventDocument) => {
    const { data, error } = await supabase.storage
      .from('event-documents')
      .download(doc.file_path);

    if (error) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (doc: EventDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    // Delete from storage
    await supabase.storage
      .from('event-documents')
      .remove([doc.file_path]);

    // Delete metadata
    await supabase
      .from('event_documents')
      .delete()
      .eq('id', doc.id);

    toast({
      title: 'Document Deleted',
      description: 'The document has been removed'
    });

    fetchDocuments();
  };

  const toggleVisibility = async (doc: EventDocument) => {
    const { error } = await supabase
      .from('event_documents')
      .update({ is_customer_visible: !doc.is_customer_visible })
      .eq('id', doc.id);

    if (!error) {
      setDocuments(documents.map(d => 
        d.id === doc.id 
          ? { ...d, is_customer_visible: !d.is_customer_visible }
          : d
      ));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.quote_request?.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.quote_request?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || doc.document_category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Add files for event management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Event</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_name} - {event.contact_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Document Category</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select File</Label>
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes about this document..."
              value={documentNotes}
              onChange={(e) => setDocumentNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCustomerVisible}
              onCheckedChange={(checked) => setIsCustomerVisible(checked as boolean)}
            />
            <Label className="cursor-pointer">Make visible to customer</Label>
          </div>

          <Button onClick={handleFileUpload} disabled={uploading || !selectedFile || !selectedEventId}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Documents</CardTitle>
              <CardDescription>Manage all uploaded documents</CardDescription>
            </div>
            <Badge variant="outline">{filteredDocuments.length} documents</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="p-2 border rounded-md bg-background"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-primary mt-1" />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.file_name}</p>
                            <Badge variant="outline" className="text-xs">
                              {DOCUMENT_CATEGORIES.find(c => c.value === doc.document_category)?.label}
                            </Badge>
                            {doc.is_customer_visible && (
                              <Badge className="text-xs bg-green-500">Visible to Customer</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.quote_request?.event_name} - {doc.quote_request?.contact_name}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                            <span>v{doc.version}</span>
                          </div>
                          {doc.notes && (
                            <p className="text-sm text-muted-foreground italic">{doc.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(doc)}
                          title={doc.is_customer_visible ? 'Hide from customer' : 'Show to customer'}
                        >
                          {doc.is_customer_visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
