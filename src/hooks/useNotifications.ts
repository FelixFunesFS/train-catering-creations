import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationItem {
  id: string;
  type: 'quote_received' | 'payment_received' | 'change_request' | 'event_upcoming' | 'feedback_received';
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch recent analytics events as notifications
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .in('event_type', [
          'quote_submitted',
          'payment_completed',
          'change_request_submitted',
          'feedback_submitted',
          'estimate_viewed'
        ])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formatted: NotificationItem[] = (data || []).map(event => ({
        id: event.id,
        type: mapEventType(event.event_type),
        title: getNotificationTitle(event.event_type),
        message: getNotificationMessage(event),
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        read: false, // In production, track read status separately
        created_at: event.created_at
      }));

      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => !n.read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events'
        },
        (payload) => {
          const event = payload.new;
          if (['quote_submitted', 'payment_completed', 'change_request_submitted', 'feedback_submitted'].includes(event.event_type)) {
            const notification: NotificationItem = {
              id: event.id,
              type: mapEventType(event.event_type),
              title: getNotificationTitle(event.event_type),
              message: getNotificationMessage(event),
              entity_type: event.entity_type,
              entity_id: event.entity_id,
              read: false,
              created_at: event.created_at
            };

            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
              });
            }

            toast({
              title: notification.title,
              description: notification.message
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch: fetchNotifications
  };
}

function mapEventType(eventType: string): NotificationItem['type'] {
  const mapping: Record<string, NotificationItem['type']> = {
    'quote_submitted': 'quote_received',
    'payment_completed': 'payment_received',
    'change_request_submitted': 'change_request',
    'feedback_submitted': 'feedback_received',
    'estimate_viewed': 'event_upcoming'
  };
  return mapping[eventType] || 'quote_received';
}

function getNotificationTitle(eventType: string): string {
  const titles: Record<string, string> = {
    'quote_submitted': 'New Quote Request',
    'payment_completed': 'Payment Received',
    'change_request_submitted': 'Change Request',
    'feedback_submitted': 'New Feedback',
    'estimate_viewed': 'Estimate Viewed'
  };
  return titles[eventType] || 'New Notification';
}

function getNotificationMessage(event: any): string {
  const metadata = event.metadata || {};
  
  switch (event.event_type) {
    case 'quote_submitted':
      return `New quote request received for ${metadata.guest_count || 0} guests`;
    case 'payment_completed':
      return `Payment of ${metadata.amount ? `$${(metadata.amount / 100).toFixed(2)}` : 'unknown amount'} received`;
    case 'change_request_submitted':
      return `Customer requested changes to their estimate`;
    case 'feedback_submitted':
      return `New feedback: ${metadata.rating || 0}/5 stars`;
    case 'estimate_viewed':
      return `Customer viewed their estimate`;
    default:
      return 'New activity detected';
  }
}
