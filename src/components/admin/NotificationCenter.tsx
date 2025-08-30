import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  DollarSign,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment_overdue' | 'change_request' | 'approval_pending' | 'event_reminder' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onRefresh: () => void;
  className?: string;
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onDismiss, 
  onRefresh, 
  className = '' 
}: NotificationCenterProps) {
  const { toast } = useToast();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return DollarSign;
      case 'change_request':
        return MessageSquare;
      case 'approval_pending':
        return Clock;
      case 'event_reminder':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (priority: string, type: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 dark:bg-red-950';
    if (priority === 'high') return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
    if (type === 'payment_overdue') return 'text-red-600 bg-red-50 dark:bg-red-950';
    if (type === 'change_request') return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    if (type === 'approval_pending') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
    return 'text-muted-foreground bg-muted';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs">Medium</Badge>;
      default:
        return null;
    }
  };

  const handleAction = async (notification: Notification) => {
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
    
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
              {urgentCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {urgentCount} Urgent
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No notifications at the moment.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClasses = getNotificationColor(notification.priority, notification.type);
            
            return (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <div className="flex items-center gap-2">
                              {notification.action_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAction(notification)}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {notification.action_label || 'View'}
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onMarkAsRead(notification.id)}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dismiss Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(notification.id)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}