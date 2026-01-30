import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventsView } from '@/components/admin/events';
import { PaymentList } from '@/components/admin/billing';
import { EmailTemplatePreview } from '@/components/admin/settings/EmailTemplatePreview';
import { EmailDeliveryPanel } from '@/components/admin/settings/EmailDeliveryPanel';
import { NotificationPreferencesPanel } from '@/components/admin/settings/NotificationPreferencesPanel';
import { Mail, Cog, Bell } from 'lucide-react';

export type AdminView = 'events' | 'billing' | 'settings';

export function UnifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Single source of truth - derive state directly from URL
  const currentView = (searchParams.get('view') as AdminView) || 'events';

  // Preserve other search params when switching views
  const handleViewChange = (view: AdminView) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', view);
      return newParams;
    }, { replace: true });
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={handleViewChange}>
      <div className="container mx-auto px-4 py-6">
        {currentView === 'events' && <EventsView />}
        
        {currentView === 'billing' && <PaymentList />}
        
        {currentView === 'settings' && (
          <Tabs defaultValue="notifications" className="space-y-4">
            <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full sm:w-auto">
                <TabsTrigger value="notifications" className="gap-2 px-3 sm:px-4">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Alerts</span>
                </TabsTrigger>
                <TabsTrigger value="emails" className="gap-2 px-3 sm:px-4">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email Templates</span>
                  <span className="sm:hidden">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="delivery" className="gap-2 px-3 sm:px-4">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email Delivery</span>
                  <span className="sm:hidden">Delivery</span>
                </TabsTrigger>
                <TabsTrigger value="general" className="gap-2 px-3 sm:px-4">
                  <Cog className="h-4 w-4" />
                  <span>General</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="notifications" className="mt-4">
              <NotificationPreferencesPanel />
            </TabsContent>
            <TabsContent value="emails" className="mt-4">
              <EmailTemplatePreview />
            </TabsContent>
            <TabsContent value="delivery" className="mt-4">
              <EmailDeliveryPanel />
            </TabsContent>
            <TabsContent value="general" className="mt-4">
              <div className="text-center py-12 text-muted-foreground">
                <Cog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>General settings coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}

export default UnifiedAdminDashboard;