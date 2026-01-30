import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, AlertCircle, Moon, Check, Loader2 } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationPreferences {
  visitor_alerts: boolean;
  quote_alerts: boolean;
  payment_alerts: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export function NotificationPreferencesPanel() {
  const { user } = useAuth();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading: pushLoading, 
    permissionState,
    isVapidConfigured,
    subscribe, 
    unsubscribe 
  } = usePushSubscription();
  const { isIOS, isInstalled } = usePWAInstall();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    visitor_alerts: false,
    quote_alerts: true,
    payment_alerts: true,
    quiet_hours_start: null,
    quiet_hours_end: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('admin_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
          console.error('Error loading preferences:', error);
          return;
        }

        if (data) {
          setPreferences({
            visitor_alerts: data.visitor_alerts,
            quote_alerts: data.quote_alerts,
            payment_alerts: data.payment_alerts,
            quiet_hours_start: data.quiet_hours_start,
            quiet_hours_end: data.quiet_hours_end,
          });
          setQuietHoursEnabled(!!data.quiet_hours_start && !!data.quiet_hours_end);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      
      // Clear quiet hours if disabled
      if (!quietHoursEnabled) {
        updatedPrefs.quiet_hours_start = null;
        updatedPrefs.quiet_hours_end = null;
      }

      const { error } = await supabase
        .from('admin_notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setPreferences(updatedPrefs);
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    savePreferences({ [key]: value });
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        // Create default preferences if first time
        await savePreferences({});
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Get real-time alerts on your phone when customers visit or take action
            </CardDescription>
          </div>
          {isSubscribed && (
            <Badge variant="default" className="bg-primary">
              <Check className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VAPID Configuration Missing */}
        {!isVapidConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not fully configured. The VAPID public key needs to be added to the environment.
            </AlertDescription>
          </Alert>
        )}

        {/* iOS PWA Requirement */}
        {isIOS && !isInstalled && isVapidConfigured && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              To enable notifications on iPhone, install this app first. Tap the <strong>Share</strong> icon in Safari and select <strong>"Add to Home Screen"</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* Support Check */}
        {!isSupported && isVapidConfigured && !(isIOS && !isInstalled) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported on this browser. Try Chrome, Firefox, Edge, or install as a PWA on iOS 16.4+.
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Denied */}
        {isSupported && permissionState === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              Notifications are blocked. Please enable them in your browser settings and reload the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Enable/Disable Push */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isSubscribed ? 'Notifications enabled on this device' : 'Enable notifications on this device'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'You will receive push notifications based on your preferences below'
                  : 'Tap to receive instant alerts when customers visit or request quotes'}
              </p>
            </div>
          </div>
          <Button 
            onClick={handlePushToggle} 
            disabled={!isSupported || pushLoading || permissionState === 'denied' || !isVapidConfigured}
            variant={isSubscribed ? 'outline' : 'default'}
          >
            {pushLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>

        {/* Notification Types */}
        {isSubscribed && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Alert Types
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="visitor-alerts" className="flex flex-col">
                    <span>Visitor Alerts</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get notified when someone visits your website
                    </span>
                  </Label>
                  <Switch
                    id="visitor-alerts"
                    checked={preferences.visitor_alerts}
                    onCheckedChange={(checked) => handleToggle('visitor_alerts', checked)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quote-alerts" className="flex flex-col">
                    <span>Quote Request Alerts</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get notified when a new quote is submitted
                    </span>
                  </Label>
                  <Switch
                    id="quote-alerts"
                    checked={preferences.quote_alerts}
                    onCheckedChange={(checked) => handleToggle('quote_alerts', checked)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-alerts" className="flex flex-col">
                    <span>Payment Alerts</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      Get notified when a payment is received
                    </span>
                  </Label>
                  <Switch
                    id="payment-alerts"
                    checked={preferences.payment_alerts}
                    onCheckedChange={(checked) => handleToggle('payment_alerts', checked)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-hours" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Quiet Hours</span>
                </Label>
                <Switch
                  id="quiet-hours"
                  checked={quietHoursEnabled}
                  onCheckedChange={(checked) => {
                    setQuietHoursEnabled(checked);
                    if (!checked) {
                      savePreferences({ quiet_hours_start: null, quiet_hours_end: null });
                    }
                  }}
                  disabled={isSaving}
                />
              </div>

              {quietHoursEnabled && (
                <div className="flex items-center gap-4 pl-6">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiet-start" className="text-sm">From</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.quiet_hours_start || '22:00'}
                      onChange={(e) => {
                        const value = e.target.value + ':00';
                        setPreferences(prev => ({ ...prev, quiet_hours_start: value }));
                      }}
                      onBlur={() => savePreferences({ quiet_hours_start: preferences.quiet_hours_start })}
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiet-end" className="text-sm">To</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.quiet_hours_end || '08:00'}
                      onChange={(e) => {
                        const value = e.target.value + ':00';
                        setPreferences(prev => ({ ...prev, quiet_hours_end: value }));
                      }}
                      onBlur={() => savePreferences({ quiet_hours_end: preferences.quiet_hours_end })}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground pl-6">
                Pause notifications during these hours (your local time)
              </p>
            </div>
          </>
        )}

        {/* iOS Notice */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <strong>iOS Users:</strong> Push notifications require iOS 16.4+ and the app must be installed to your home screen. 
          Tap the share icon in Safari and select "Add to Home Screen."
        </div>
      </CardContent>
    </Card>
  );
}
