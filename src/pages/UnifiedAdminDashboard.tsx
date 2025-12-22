import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventsView } from '@/components/admin/events';
import { PaymentList } from '@/components/admin/billing';
import { EmailTemplatePreview } from '@/components/admin/settings/EmailTemplatePreview';
import { Mail, Cog } from 'lucide-react';

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
          <Tabs defaultValue="emails" className="space-y-4">
            <TabsList>
              <TabsTrigger value="emails" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Templates
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-2">
                <Cog className="h-4 w-4" />
                General
              </TabsTrigger>
            </TabsList>
            <TabsContent value="emails" className="mt-4">
              <EmailTemplatePreview />
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