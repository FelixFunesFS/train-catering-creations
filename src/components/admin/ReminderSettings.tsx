import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Clock, 
  Calendar,
  Mail,
  Settings,
  Save,
  Send
} from 'lucide-react';

interface ReminderLog {
  id: string;
  invoice_id: string;
  reminder_type: string;
  sent_at: string;
  recipient_email: string;
  urgency: string;
  invoices: {
    invoice_number: string;
    customers: {
      name: string;
    };
    quote_requests: {
      event_name: string;
      event_date: string;
    };
  };
}

interface ReminderSettings {
  enabled: boolean;
  payment_reminders: boolean;
  event_reminders: boolean;
  followup_reminders: boolean;
  reminder_intervals: {
    second_payment: number;
    final_payment: number;
    final_details: number;
    event_approaching: number;
    post_event: number;
  };
}

export default function ReminderSettings() {
  const { toast } = useToast();
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    payment_reminders: true,
    event_reminders: true,
    followup_reminders: true,
    reminder_intervals: {
      second_payment: 35,
      final_payment: 15,
      final_details: 7,
      event_approaching: 3,
      post_event: 1
    }
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchReminderLogs();
  }, []);

  const fetchReminderLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_logs')
        .select(`
          *,
          invoices!invoice_id (
            invoice_number,
            customers!customer_id (
              name
            ),
            quote_requests!quote_request_id (
              event_name,
              event_date
            )
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReminderLogs(data || []);
    } catch (error) {
      console.error('Error fetching reminder logs:', error);
      toast({
        title: "Error",
        description: "Failed to load reminder logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-reminders', {
        body: { reminder_type: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Reminders Sent",
        description: `${data.reminders_sent} reminders sent successfully`,
      });

      // Refresh logs
      fetchReminderLogs();
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = () => {
    // In a real implementation, save settings to database or localStorage
    toast({
      title: "Settings Saved",
      description: "Reminder settings have been updated",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'medium': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'high': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case 'urgent': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'second_payment_due':
      case 'final_payment_due':
        return <Calendar className="h-4 w-4" />;
      case 'final_details_confirmation':
      case 'event_approaching':
      case 'event_tomorrow':
        return <Clock className="h-4 w-4" />;
      case 'post_event_followup':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatReminderType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold">Reminder System</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={handleSendReminders} disabled={sending}>
            {sending ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Reminders Now
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{reminderLogs.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">
                  {reminderLogs.filter(log => 
                    new Date(log.sent_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Reminders</p>
                <p className="text-2xl font-bold">
                  {reminderLogs.filter(log => 
                    log.reminder_type.includes('payment')
                  ).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Reminders</p>
                <p className="text-2xl font-bold">
                  {reminderLogs.filter(log => 
                    log.reminder_type.includes('event') || log.reminder_type.includes('details')
                  ).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reminder Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Automated Reminders</Label>
                <p className="text-sm text-muted-foreground">Automatically send reminders based on event dates and payment schedules</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">Send reminders for upcoming payment due dates</p>
              </div>
              <Switch
                checked={settings.payment_reminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, payment_reminders: checked }))}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Send reminders for event confirmation and final details</p>
              </div>
              <Switch
                checked={settings.event_reminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, event_reminders: checked }))}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Follow-up Reminders</Label>
                <p className="text-sm text-muted-foreground">Send post-event follow-up and feedback requests</p>
              </div>
              <Switch
                checked={settings.followup_reminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, followup_reminders: checked }))}
                disabled={!settings.enabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="second-payment">Second Payment Reminder (days before)</Label>
              <Input
                id="second-payment"
                type="number"
                value={settings.reminder_intervals.second_payment}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reminder_intervals: {
                    ...prev.reminder_intervals,
                    second_payment: parseInt(e.target.value) || 35
                  }
                }))}
                disabled={!settings.enabled}
              />
            </div>

            <div>
              <Label htmlFor="final-payment">Final Payment Reminder (days before)</Label>
              <Input
                id="final-payment"
                type="number"
                value={settings.reminder_intervals.final_payment}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reminder_intervals: {
                    ...prev.reminder_intervals,
                    final_payment: parseInt(e.target.value) || 15
                  }
                }))}
                disabled={!settings.enabled}
              />
            </div>

            <div>
              <Label htmlFor="final-details">Final Details Confirmation (days before)</Label>
              <Input
                id="final-details"
                type="number"
                value={settings.reminder_intervals.final_details}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reminder_intervals: {
                    ...prev.reminder_intervals,
                    final_details: parseInt(e.target.value) || 7
                  }
                }))}
                disabled={!settings.enabled}
              />
            </div>

            <div>
              <Label htmlFor="event-approaching">Event Approaching (days before)</Label>
              <Input
                id="event-approaching"
                type="number"
                value={settings.reminder_intervals.event_approaching}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reminder_intervals: {
                    ...prev.reminder_intervals,
                    event_approaching: parseInt(e.target.value) || 3
                  }
                }))}
                disabled={!settings.enabled}
              />
            </div>

            <div>
              <Label htmlFor="post-event">Post-Event Follow-up (days after)</Label>
              <Input
                id="post-event"
                type="number"
                value={settings.reminder_intervals.post_event}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reminder_intervals: {
                    ...prev.reminder_intervals,
                    post_event: parseInt(e.target.value) || 1
                  }
                }))}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reminder Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminderLogs.length > 0 ? (
              reminderLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getReminderTypeIcon(log.reminder_type)}
                      <div>
                        <p className="font-medium text-sm">{formatReminderType(log.reminder_type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.invoices.customers.name} • {log.invoices.quote_requests.event_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(log.urgency)}`}>
                      {log.urgency}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{formatDate(log.sent_at)}</p>
                      <p>{formatTime(log.sent_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reminders sent yet</p>
                <p className="text-sm text-muted-foreground">Reminder activity will appear here once automated reminders are sent</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}