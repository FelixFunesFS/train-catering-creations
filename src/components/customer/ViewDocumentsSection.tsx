import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ViewDocumentsSectionProps {
  quoteId: string;
  invoiceId: string;
}

export function ViewDocumentsSection({ quoteId, invoiceId }: ViewDocumentsSectionProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [quoteId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // Fetch customer-visible documents
      const { data, error } = await supabase
        .from('event_documents')
        .select('*')
        .eq('quote_request_id', quoteId)
        .eq('is_customer_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('event-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `Downloaded ${document.file_name}`,
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      contract: { label: 'Contract', variant: 'default' },
      invoice: { label: 'Invoice', variant: 'secondary' },
      menu: { label: 'Menu', variant: 'outline' },
      timeline: { label: 'Timeline', variant: 'outline' },
      other: { label: 'Other', variant: 'outline' },
    };

    const config = categoryMap[category] || categoryMap.other;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Event Documents
            </CardTitle>
            <CardDescription>
              View and download documents related to your event
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground">
                Documents will appear here once they're ready
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getCategoryIcon(doc.document_category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      {getCategoryBadge(doc.document_category)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                      </span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      {doc.version > 1 && <span>Version {doc.version}</span>}
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
