import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Bell, 
  Mail, 
  CreditCard,
  Shield,
  Database,
  Palette,
  Users
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      weeklyReports: true
    },
    business: {
      businessName: 'Soul Train\'s Eatery',
      email: 'soultrainseatery@gmail.com',
      phone: '(843) 970-0265',
      address: 'Charleston, SC',
      taxRate: '8.5'
    },
    automation: {
      autoStatusUpdate: true,
      autoReminders: true,
      autoInvoiceGeneration: false,
      calendarSync: true
    }
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully"
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your system preferences and configurations</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.business.businessName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      business: { ...prev.business, businessName: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.business.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      business: { ...prev.business, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.business.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      business: { ...prev.business, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    value={settings.business.taxRate}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      business: { ...prev.business, taxRate: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={settings.business.address}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    business: { ...prev.business, address: e.target.value }
                  }))}
                />
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'emailAlerts' && 'Receive email notifications for important events'}
                      {key === 'pushNotifications' && 'Browser push notifications'}
                      {key === 'smsAlerts' && 'SMS alerts for urgent matters'}
                      {key === 'weeklyReports' && 'Weekly business summary reports'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.automation).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'autoStatusUpdate' && 'Automatically update quote/invoice statuses'}
                      {key === 'autoReminders' && 'Send automatic payment reminders'}
                      {key === 'autoInvoiceGeneration' && 'Generate invoices from approved quotes'}
                      {key === 'calendarSync' && 'Sync events with Google Calendar'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        automation: { ...prev.automation, [key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
              <Button onClick={handleSave}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Stripe Integration</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure your Stripe payment processor settings
                  </p>
                  <Button variant="outline">Configure Stripe</Button>
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Set default payment terms for invoices
                  </p>
                  <Input placeholder="Net 30 days" />
                </div>
                <div>
                  <Label>Late Fee Settings</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure late payment fees
                  </p>
                  <Input placeholder="2.5% per month" />
                </div>
              </div>
              <Button onClick={handleSave}>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Update your admin password
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <div>
                  <Label>Login History</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    View recent login activity
                  </p>
                  <Button variant="outline">View History</Button>
                </div>
              </div>
              <Button onClick={handleSave}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}