import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomerNotification {
  id: string;
  type: 'estimate_updated' | 'status_changed' | 'payment_reminder' | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: {
    estimateId?: string;
    oldVersion?: number;
    newVersion?: number;
    statusFrom?: string;
    statusTo?: string;
    changeHighlights?: string[];
  };
}

interface UseCustomerNotificationsProps {
  customerEmail?: string;
  invoiceId?: string;
  quoteId?: string;
}

export function useCustomerNotifications({
  customerEmail,
  invoiceId,
  quoteId
}: UseCustomerNotificationsProps) {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notifications from workflow_state_log and other sources
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationsData: CustomerNotification[] = [];

      // Fetch status change notifications
      if (invoiceId) {
        const { data: statusLogs, error } = await supabase
          .from('workflow_state_log')
          .select('*')
          .eq('entity_id', invoiceId)
          .eq('entity_type', 'invoices')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && statusLogs) {
          statusLogs.forEach(log => {
            notificationsData.push({
              id: `status_${log.id}`,
              type: 'status_changed',
              title: 'Status Updated',
              message: `Your estimate status changed from ${log.previous_status} to ${log.new_status}`,
              read: false,
              created_at: log.created_at,
              metadata: {
                statusFrom: log.previous_status,
                statusTo: log.new_status
              }
            });
          });
        }
      }

      // Fetch estimate version notifications
      if (invoiceId) {
        const { data: versions, error } = await supabase
          .from('estimate_versions')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && versions && versions.length > 1) {
          // Create notifications for version changes
          for (let i = 0; i < versions.length - 1; i++) {
            const currentVersion = versions[i];
            const previousVersion = versions[i + 1];
            
            notificationsData.push({
              id: `version_${currentVersion.id}`,
              type: 'estimate_updated',
              title: 'Estimate Updated',
              message: `Your estimate has been updated to version ${currentVersion.version_number}`,
              read: false,
              created_at: currentVersion.created_at,
              metadata: {
                estimateId: invoiceId,
                oldVersion: previousVersion.version_number,
                newVersion: currentVersion.version_number,
                changeHighlights: generateChangeHighlights(previousVersion, currentVersion)
              }
            });
          }
        }
      }

      // Sort notifications by date
      notificationsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate change highlights for estimate updates
  const generateChangeHighlights = (oldVersion: any, newVersion: any): string[] => {
    const highlights: string[] = [];
    
    if (oldVersion.subtotal !== newVersion.subtotal) {
      highlights.push(`Subtotal changed from $${(oldVersion.subtotal / 100).toFixed(2)} to $${(newVersion.subtotal / 100).toFixed(2)}`);
    }
    
    if (oldVersion.total_amount !== newVersion.total_amount) {
      highlights.push(`Total amount changed from $${(oldVersion.total_amount / 100).toFixed(2)} to $${(newVersion.total_amount / 100).toFixed(2)}`);
    }

    // Compare line items length
    const oldItems = oldVersion.line_items || [];
    const newItems = newVersion.line_items || [];
    
    if (oldItems.length !== newItems.length) {
      if (newItems.length > oldItems.length) {
        highlights.push(`${newItems.length - oldItems.length} item(s) added`);
      } else {
        highlights.push(`${oldItems.length - newItems.length} item(s) removed`);
      }
    }

    return highlights;
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!invoiceId) return;

    const channel = supabase
      .channel('customer-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_state_log',
          filter: `entity_id=eq.${invoiceId}`
        },
        (payload) => {
          const newNotification: CustomerNotification = {
            id: `status_${payload.new.id}`,
            type: 'status_changed',
            title: 'Status Updated',
            message: `Your estimate status changed to ${payload.new.new_status}`,
            read: false,
            created_at: payload.new.created_at,
            metadata: {
              statusFrom: payload.new.previous_status,
              statusTo: payload.new.new_status
            }
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: "Status Update",
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'estimate_versions',
          filter: `invoice_id=eq.${invoiceId}`
        },
        (payload) => {
          const newNotification: CustomerNotification = {
            id: `version_${payload.new.id}`,
            type: 'estimate_updated',
            title: 'Estimate Updated',
            message: `Your estimate has been updated to version ${payload.new.version_number}`,
            read: false,
            created_at: payload.new.created_at,
            metadata: {
              estimateId: invoiceId,
              newVersion: payload.new.version_number
            }
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: "Estimate Updated",
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, toast]);

  useEffect(() => {
    if (customerEmail || invoiceId || quoteId) {
      fetchNotifications();
    }
  }, [customerEmail, invoiceId, quoteId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}