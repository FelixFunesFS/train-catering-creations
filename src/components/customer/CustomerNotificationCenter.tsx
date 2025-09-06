import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  FileText,
  TrendingUp,
  Info
} from 'lucide-react';
import { useCustomerNotifications, CustomerNotification } from '@/hooks/useCustomerNotifications';
import { formatDistanceToNow } from 'date-fns';

interface CustomerNotificationCenterProps {
  customerEmail?: string;
  invoiceId?: string;
  quoteId?: string;
  compact?: boolean;
}

export function CustomerNotificationCenter({
  customerEmail,
  invoiceId,
  quoteId,
  compact = false
}: CustomerNotificationCenterProps) {
  const [showAll, setShowAll] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useCustomerNotifications({
    customerEmail,
    invoiceId,
    quoteId
  });

  const getNotificationIcon = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'estimate_updated':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'status_changed':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'payment_reminder':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'estimate_updated':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
      case 'status_changed':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
      case 'payment_reminder':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20';
      default:
        return 'border-l-muted bg-muted/20';
    }
  };

  const displayedNotifications = compact 
    ? notifications.slice(0, showAll ? notifications.length : 3)
    : notifications;

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-primary" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-sm"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              We'll notify you of any updates to your estimate or status changes
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-auto" : "h-96"}>
            <div className="space-y-3">
              {displayedNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`
                      relative p-4 rounded-lg border-l-4 transition-all duration-200 cursor-pointer
                      ${getNotificationColor(notification.type)}
                      ${!notification.read ? 'shadow-sm' : 'opacity-75'}
                      hover:shadow-md
                    `}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </h4>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Show change highlights for estimate updates */}
                        {notification.type === 'estimate_updated' && notification.metadata?.changeHighlights && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">What's Changed:</p>
                            <div className="space-y-1">
                              {notification.metadata.changeHighlights.map((highlight, idx) => (
                                <div key={idx} className="text-xs bg-background rounded px-2 py-1 border">
                                  {highlight}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < displayedNotifications.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {compact && notifications.length > 3 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-sm"
            >
              {showAll ? 'Show less' : `Show all ${notifications.length} notifications`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}