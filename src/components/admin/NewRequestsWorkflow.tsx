import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuoteManagementTab } from './QuoteManagementTab';
import { 
  PlayCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

interface NewRequestsWorkflowProps {
  quotes: any[];
  loading: boolean;
  onRefresh: () => void;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  invoices?: any[];
}

export function NewRequestsWorkflow({ 
  quotes, 
  loading, 
  onRefresh, 
  selectedItems, 
  onSelectionChange,
  invoices = []
}: NewRequestsWorkflowProps) {
  const navigate = useNavigate();
  
  // Organize quotes into workflow queues
  const newRequests = quotes.filter(q => q.status === 'pending');
  const needsAttention = quotes.filter(q => 
    q.status === 'pending' && 
    new Date(q.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
  );

  const getUrgencyLevel = (quote: any) => {
    const hoursOld = (Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursOld > 48) return 'high';
    if (hoursOld > 24) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Needs Immediate Attention</span>
            </div>
            <div className="text-2xl font-bold">{needsAttention.length}</div>
            <p className="text-xs text-muted-foreground">Requests over 24 hours old</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">New Requests</span>
            </div>
            <div className="text-2xl font-bold">{newRequests.length}</div>
            <p className="text-xs text-muted-foreground">Ready for pricing</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Queue - Requests needing immediate attention */}
      {needsAttention.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Priority Queue - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.map((quote) => {
                const urgency = getUrgencyLevel(quote);
                return (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{quote.event_name}</h4>
                        <Badge variant={getUrgencyColor(urgency) as any}>
                          {urgency} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quote.contact_name} • {quote.guest_count} guests • {new Date(quote.event_date).toLocaleDateString()}
                      </p>
                      {quote.special_requests && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Special: {quote.special_requests.substring(0, 50)}...
                        </p>
                      )}
                      <p className="text-xs text-red-600">
                        Submitted {Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60))} hours ago
                      </p>
                    </div>
                    {(() => {
                      const hasEstimate = invoices.some(inv => inv.quote_request_id === quote.id);
                      return (
                        <Button 
                          size="sm" 
                          className={`ml-4 ${hasEstimate ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                          onClick={() => hasEstimate ? null : navigate(`/admin/estimates/${quote.id}`)}
                          disabled={hasEstimate}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {hasEstimate ? 'Estimate Created' : 'Set Pricing'}
                        </Button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Filter to show only new requests
                const newRequestIds = newRequests.map(q => q.id);
                onSelectionChange(newRequestIds);
              }}
            >
              Select All New ({newRequests.length})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Filter to show only urgent requests
                const urgentIds = needsAttention.map(q => q.id);
                onSelectionChange(urgentIds);
              }}
            >
              Select All Urgent ({needsAttention.length})
            </Button>
            <Button variant="outline" size="sm">
              Export New Requests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Request List */}
      <QuoteManagementTab 
        quotes={quotes}
        loading={loading}
        onRefresh={async () => onRefresh()}
        selectedItems={selectedItems}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}