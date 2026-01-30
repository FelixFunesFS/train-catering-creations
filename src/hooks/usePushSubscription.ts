import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// VAPID public key - must match the one in Supabase secrets
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
const IS_VAPID_CONFIGURED = Boolean(VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY.length > 10);

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  // Check if push is supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        setPermissionState(Notification.permission);
      }
    };
    
    checkSupport();
  }, []);

  // Check current subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        
        if (existingSub) {
          // Verify it exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', existingSub.endpoint)
            .single();
          
          if (data) {
            setSubscription(existingSub);
            setIsSubscribed(true);
          } else {
            // Subscription exists locally but not in DB, unsubscribe
            await existingSub.unsubscribe();
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  const subscribe = useCallback(async (deviceName?: string) => {
    if (!isSupported || !user) {
      toast.error('Push notifications are not supported on this device');
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      toast.error('Push notifications are not configured');
      return false;
    }

    try {
      setIsLoading(true);

      // Request permission if needed
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        
        if (permission !== 'granted') {
          toast.error('Notification permission denied');
          return false;
        }
      } else if (Notification.permission === 'denied') {
        toast.error('Notifications are blocked. Please enable them in browser settings.');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Extract keys
      const subscriptionJson = newSubscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || '';
      const auth = subscriptionJson.keys?.auth || '';

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: newSubscription.endpoint,
          p256dh,
          auth,
          device_name: deviceName || getDeviceName(),
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        await newSubscription.unsubscribe();
        toast.error('Failed to save subscription');
        return false;
      }

      setSubscription(newSubscription);
      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!subscription || !user) return false;

    try {
      setIsLoading(true);

      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      // Unsubscribe from push manager
      await subscription.unsubscribe();

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to disable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, user]);

  return {
    isSupported: isSupported && IS_VAPID_CONFIGURED,
    isSubscribed,
    isLoading,
    permissionState,
    isVapidConfigured: IS_VAPID_CONFIGURED,
    subscribe,
    unsubscribe,
  };
}

// Helper to get device name
function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    const match = ua.match(/Android.*?;\s*([^)]+)/);
    return match ? match[1].split(' Build')[0] : 'Android Device';
  }
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux PC';
  
  return 'Unknown Device';
}
