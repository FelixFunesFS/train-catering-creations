import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChangeRequestNotification {
  id: string;
  type: 'new_request' | 'status_update' | 'customer_response';
  title: string;
  message: string;
  changeRequestId: string;
  customerEmail: string;
  eventName?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  read: boolean;
}

export function useChangeRequestNotifications() {
  const [notifications, setNotifications] = useState<ChangeRequestNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time change request updates
    const channel = supabase
      .channel('change-requests-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'change_requests'
        },
        (payload) => {
          handleNewChangeRequest(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'change_requests'
        },
        (payload) => {
          handleChangeRequestUpdate(payload.new, payload.old);
        }
      )
      .subscribe();

    // Load initial notifications
    loadRecentNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewChangeRequest = async (changeRequest: any) => {
    // Fetch additional details
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select(`
        quote_requests!quote_request_id(event_name, contact_name)
      `)
      .eq('id', changeRequest.invoice_id)
      .single();

    const notification: ChangeRequestNotification = {
      id: `new_${changeRequest.id}`,
      type: 'new_request',
      title: 'New Change Request',
      message: `${changeRequest.customer_email} has requested changes to their estimate`,
      changeRequestId: changeRequest.id,
      customerEmail: changeRequest.customer_email,
      eventName: invoiceData?.quote_requests?.event_name,
      priority: changeRequest.priority || 'medium',
      created_at: changeRequest.created_at,
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const handleChangeRequestUpdate = async (newRequest: any, oldRequest: any) => {
    // Only notify on status changes
    if (newRequest.status !== oldRequest.status && newRequest.status !== 'pending') {
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select(`
          quote_requests!quote_request_id(event_name, contact_name)
        `)
        .eq('id', newRequest.invoice_id)
        .single();

      const notification: ChangeRequestNotification = {
        id: `update_${newRequest.id}_${Date.now()}`,
        type: 'status_update',
        title: 'Change Request Processed',
        message: `Change request for ${invoiceData?.quote_requests?.event_name || 'event'} has been ${newRequest.status}`,
        changeRequestId: newRequest.id,
        customerEmail: newRequest.customer_email,
        eventName: invoiceData?.quote_requests?.event_name,
        priority: 'low',
        created_at: newRequest.updated_at,
        read: false
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      // Load recent change requests to generate notifications
      const { data: changeRequests } = await supabase
        .from('change_requests')
        .select(`
          *,
          invoices!inner(
            quote_requests!quote_request_id(event_name, contact_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (changeRequests) {
        const notifications = changeRequests.map(request => ({
          id: `history_${request.id}`,
          type: 'new_request' as const,
          title: request.workflow_status === 'pending' ? 'Pending Change Request' : 'Change Request Processed',
          message: `${request.customer_email} - ${request.invoices?.quote_requests?.event_name || 'Event'}`,
          changeRequestId: request.id,
          customerEmail: request.customer_email,
          eventName: request.invoices?.quote_requests?.event_name,
          priority: (request.priority as 'low' | 'medium' | 'high') || 'medium',
          created_at: request.created_at,
          read: request.workflow_status !== 'pending'
        }));

        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading change request notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refresh: loadRecentNotifications
  };
}