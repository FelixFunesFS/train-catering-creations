import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedStatusManagement } from '@/hooks/useUnifiedStatusManagement';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Calendar,
  RotateCcw,
  Eye,
  Send,
  MessageSquare
} from 'lucide-react';

interface StatusManagementPanelProps {
  entityType: 'quote' | 'invoice';
  entityId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  userRole?: 'admin' | 'customer';
}

export function StatusManagementPanel({
  entityType,
  entityId,
  currentStatus,
  onStatusChange,
  userRole = 'admin'
}: StatusManagementPanelProps) {
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    updateStatus,
    getStatusHistory,
    getAvailableTransitions,
    getStatusColor,
    statusHistory,
    loading
  } = useUnifiedStatusManagement();

  React.useEffect(() => {
    getStatusHistory(entityType, entityId);
  }, [entityType, entityId, getStatusHistory]);

  const availableTransitions = getAvailableTransitions(entityType, currentStatus, userRole);

  const handleStatusUpdate = async () => {
    if (!selectedNewStatus) return;

    setIsUpdating(true);
    const result = await updateStatus(
      entityType,
      entityId,
      selectedNewStatus,
      userRole,
      `Status updated via admin panel`
    );

    if (result.success) {
      onStatusChange?.(selectedNewStatus);
      setSelectedNewStatus('');
      // Refresh status history
      await getStatusHistory(entityType, entityId);
    }

    setIsUpdating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'pending_review':
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'sent':
      case 'quoted': return <Send className="h-4 w-4" />;
      case 'customer_approved':
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'customer_requested_changes': return <MessageSquare className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(currentStatus)} variant="outline">
              {formatStatus(currentStatus)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {entityType === 'quote' ? 'Quote' : 'Estimate'} Status
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Update */}
      {availableTransitions.length > 0 && userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((transition) => (
                    <SelectItem key={transition.to} value={transition.to}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transition.to)}
                        <span>{formatStatus(transition.to)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          - {transition.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedNewStatus && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {availableTransitions.find(t => t.to === selectedNewStatus)?.description}
                  {availableTransitions.find(t => t.to === selectedNewStatus)?.requiresNotification && (
                    <span className="block mt-1 text-xs">
                      ⓘ Customer will be notified of this change
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleStatusUpdate}
              disabled={!selectedNewStatus || isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          ) : statusHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No status changes recorded
            </p>
          ) : (
            <div className="space-y-4">
              {statusHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(entry.new_status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={getStatusColor(entry.new_status)} 
                        variant="outline"
                      >
                        {formatStatus(entry.new_status)}
                      </Badge>
                      {entry.previous_status && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            from {formatStatus(entry.previous_status)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.changed_by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.change_reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.change_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions based on current status */}
      {currentStatus === 'customer_requested_changes' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-3">
              Customer has requested changes to this estimate. Review the change request and update the estimate accordingly.
            </p>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Change Request
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStatus === 'expired' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Estimate Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-3">
              This estimate has expired. You may need to create a new version or extend the validity period.
            </p>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Create New Version
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}