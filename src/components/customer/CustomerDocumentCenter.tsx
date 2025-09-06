import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  type: 'quote' | 'invoice' | 'contract' | 'receipt';
  name: string;
  status: 'draft' | 'sent' | 'signed' | 'paid';
  created_at: string;
  size?: string;
}

interface CustomerDocumentCenterProps {
  customerId?: string;
  invoiceId?: string;
  quoteId?: string;
}

export function CustomerDocumentCenter({
  customerId,
  invoiceId,
  quoteId
}: CustomerDocumentCenterProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock documents for now
    const mockDocs: Document[] = [
      {
        id: '1',
        type: 'quote',
        name: 'Event Quote - Wedding Catering',
        status: 'sent',
        created_at: new Date().toISOString(),
        size: '245 KB'
      },
      {
        id: '2',
        type: 'invoice',
        name: 'Invoice #INV-2024-001',
        status: 'sent',
        created_at: new Date().toISOString(),
        size: '180 KB'
      }
    ];
    
    setDocuments(mockDocs);
    setLoading(false);
  }, [customerId, invoiceId, quoteId]);

  const getDocumentIcon = (type: Document['type']) => {
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No documents available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getDocumentIcon(doc.type)}
                  <div>
                    <h4 className="font-medium text-sm">{doc.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(doc.status)} variant="secondary">
                        {doc.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </span>
                      {doc.size && (
                        <span className="text-xs text-muted-foreground">
                          • {doc.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
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