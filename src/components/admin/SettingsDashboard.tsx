import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessSettings } from '@/components/admin/BusinessSettings';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { Settings, Bell, Building2, Users, Mail } from 'lucide-react';
import { useState } from 'react';

export function SettingsDashboard() {
  const [mockNotifications] = useState([
    {
      id: '1',
      type: 'change_request' as const,
      title: 'New Change Request',
      message: 'Customer requested menu changes',
      priority: 'high' as const,
      created_at: new Date().toISOString(),
      read: false
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    console.log('Mark as read:', id);
  };

  const handleDismiss = (id: string) => {
    console.log('Dismiss:', id);
  };

  const handleRefresh = () => {
    console.log('Refresh notifications');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your business configuration and preferences
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">
            <Building2 className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter
            notifications={mockNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDismiss={handleDismiss}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
