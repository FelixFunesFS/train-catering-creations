import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface ChangeRequestHistoryProps {
  invoiceId: string;
  quoteId: string;
}

interface ChangeRequest {
  id: string;
  request_type: string;
  workflow_status: string;
  requested_changes: any;
  original_details: any;
  admin_response?: string;
  estimated_cost_change: number;
  created_at: string;
  reviewed_at?: string;
}

export function ChangeRequestHistory({ invoiceId, quoteId }: ChangeRequestHistoryProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChangeRequests();
  }, [invoiceId]);

  const fetchChangeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChangeRequests(data || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { 
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        icon: <Clock className="h-3 w-3" />
      },
      approved: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: <XCircle className="h-3 w-3" />
      },
      reviewing: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: <Clock className="h-3 w-3" />
      }
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge className={config.color}>
        <span className="flex items-center gap-1">
          {config.icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    const value = Math.abs(amount) / 100;
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${value.toFixed(2)}`;
  };

  const renderChangeComparison = (request: ChangeRequest) => {
    const changes = request.requested_changes;
    const original = request.original_details;

    return (
      <div className="space-y-3 text-sm">
        {changes.event_date && changes.event_date !== original.event_date && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Event Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="line-through text-muted-foreground">
                {new Date(original.event_date).toLocaleDateString()}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(changes.event_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {changes.guest_count && changes.guest_count !== original.guest_count && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Guest Count</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="line-through text-muted-foreground">
                {original.guest_count}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{changes.guest_count}</span>
            </div>
          </div>
        )}

        {changes.location && changes.location !== original.location && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="line-through text-muted-foreground max-w-[120px] truncate">
                {original.location}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium max-w-[120px] truncate">{changes.location}</span>
            </div>
          </div>
        )}

        {changes.menu_changes && (
          <div className="pt-2 border-t">
            <p className="font-medium text-sm mb-2">Menu Changes:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {changes.menu_changes.added_items?.length > 0 && (
                <li>+ Added {changes.menu_changes.added_items.length} item(s)</li>
              )}
              {changes.menu_changes.removed_items?.length > 0 && (
                <li>- Removed {changes.menu_changes.removed_items.length} item(s)</li>
              )}
              {changes.menu_changes.modified_quantities?.length > 0 && (
                <li>~ Modified {changes.menu_changes.modified_quantities.length} quantity(ies)</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading change history...</div>
        </CardContent>
      </Card>
    );
  }

  if (changeRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No change requests yet</p>
            <p className="text-sm mt-2">Any changes you request will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Change History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track all changes made to your quote
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changeRequests.map((request, index) => (
            <div key={request.id}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.workflow_status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {request.request_type.split('_').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')} Request
                    </p>
                  </div>

                  {/* Cost Impact */}
                  {request.estimated_cost_change !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {request.estimated_cost_change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                      <span className={
                        request.estimated_cost_change > 0 
                          ? 'text-orange-600 font-medium' 
                          : 'text-green-600 font-medium'
                      }>
                        {formatCurrency(request.estimated_cost_change)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Changes Comparison */}
                <div className="bg-muted/50 rounded-lg p-3">
                  {renderChangeComparison(request)}
                </div>

                {/* Admin Response */}
                {request.admin_response && (
                  <div className="border-l-2 border-primary pl-3 py-1">
                    <p className="text-xs font-medium text-primary mb-1">Our Response:</p>
                    <p className="text-sm text-muted-foreground">{request.admin_response}</p>
                    {request.reviewed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reviewed on {new Date(request.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {index < changeRequests.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
