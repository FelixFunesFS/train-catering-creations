import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  CreditCard,
  FileCheck
} from 'lucide-react';

interface CustomerDocumentsProps {
  invoice: any;
  documents: any[];
}

export function CustomerDocuments({ invoice, documents }: CustomerDocumentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAvailableDocuments = () => {
    const docs = [
      {
        id: 'estimate',
        title: 'Catering Estimate',
        description: 'Detailed breakdown of catering services and pricing',
        type: 'estimate',
        icon: FileText,
        status: invoice.is_draft ? 'draft' : 'available',
        date: invoice.created_at,
        downloadable: !invoice.is_draft
      }
    ];

    // Add contract if estimate is approved
    if (['approved', 'deposit_paid', 'confirmed'].includes(invoice.workflow_status)) {
      docs.push({
        id: 'contract',
        title: 'Catering Contract',
        description: 'Official catering service agreement',
        type: 'contract',
        icon: FileCheck,
        status: 'available',
        date: invoice.updated_at,
        downloadable: true
      });
    }

    // Add receipt if payment made
    if (['deposit_paid', 'confirmed'].includes(invoice.workflow_status)) {
      docs.push({
        id: 'receipt',
        title: 'Payment Receipt',
        description: 'Deposit payment confirmation',
        type: 'receipt',
        icon: CreditCard,
        status: 'available',
        date: invoice.paid_at || invoice.updated_at,
        downloadable: true
      });
    }

    return docs;
  };

  const handleDownload = async (docType: string) => {
    // Implementation would depend on actual document storage
    console.log('Download document:', docType);
  };

  const handleView = async (docType: string) => {
    if (docType === 'estimate') {
      // Open estimate in new window using token from URL
      const token = new URLSearchParams(window.location.search).get('token');
      if (token) {
        window.open(`/estimate?token=${token}`, '_blank');
      }
    }
  };

  const availableDocuments = getAvailableDocuments();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableDocuments.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={doc.status === 'available' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {doc.status === 'available' ? 'Ready' : 'Draft'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc.type)}
                      disabled={doc.status === 'draft'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {doc.downloadable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.type)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {availableDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Documents Available</h3>
              <p className="text-muted-foreground text-sm">
                Documents will appear here as your catering request progresses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.location.href = 'mailto:soultrainseatery@gmail.com'}
            >
              <Calendar className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Schedule Consultation</div>
                <div className="text-xs text-muted-foreground">Discuss your event details</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.location.href = 'tel:(843) 970-0265'}
            >
              <CreditCard className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Payment Questions</div>
                <div className="text-xs text-muted-foreground">Get help with payment</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}