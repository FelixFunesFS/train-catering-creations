import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useQuoteNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Load initial unread count
    loadUnreadCount();

    // Set up realtime subscription
    const channel = supabase
      .channel('quote_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quote_requests'
        },
        (payload) => {
          console.log('New quote request:', payload);
          handleNewQuote(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUnreadCount = async () => {
    const { count, error } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const handleNewQuote = (quote: any) => {
    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: "New Quote Request",
      description: `${quote.contact_name} requested a quote for ${quote.event_name}`,
      duration: 5000
    });

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Quote Request - Soul Train\'s Eatery', {
        body: `${quote.contact_name} - ${quote.event_name}`,
        icon: '/favicon.ico',
        tag: quote.id,
        requireInteraction: false
      });
    }

    // Play notification sound (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe56+ijUBELTKXh8bllHAU2jdXvyH0pBiJ1w+3glEILElyx6OyrWBQLRp/e8r9vJAUpgM3y2Ik2CBdjuOrtpFURCkyl4PG5ZBwFNo3V78h9KQYhdcPt4JRCCxJbrO3trFgVC0af3vK/byQFKYDN8tmJNggXY7jq7aRVEQpMpeDxuWQcBTaN1e/IfSkGIXXD7eCUQgsS');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio errors (user might not have interacted yet)
      });
    } catch (e) {
      // Ignore
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    markAsRead
  };
};
