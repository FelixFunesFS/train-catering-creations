import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChangeRequestNotifications } from '@/hooks/useChangeRequestNotifications';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';

interface ChangeRequestNotificationCenterProps {
  onNavigateToChangeRequests?: () => void;
}

export function ChangeRequestNotificationCenter({ onNavigateToChangeRequests }: ChangeRequestNotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useChangeRequestNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_request': return <MessageSquare className="h-4 w-4" />;
      case 'status_update': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Change Request Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
                <Button variant="outline" size="sm" onClick={clearNotifications}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No change request notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {notification.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      {notification.eventName && (
                        <p className="text-xs text-muted-foreground">
                          Event: {notification.eventName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 px-2"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToChangeRequests}
                      className="h-6 px-2 text-xs"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 5 && (
              <div className="text-center pt-3">
                <Button variant="outline" size="sm" onClick={onNavigateToChangeRequests}>
                  View All {notifications.length} Notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}