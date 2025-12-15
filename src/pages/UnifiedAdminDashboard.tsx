import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventList } from '@/components/admin/events';
import { PaymentList } from '@/components/admin/billing';
import { Settings } from 'lucide-react';

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
        {currentView === 'events' && <EventList />}
        
        {currentView === 'billing' && <PaymentList />}
        
        {currentView === 'settings' && (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Email templates and configuration coming next
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default UnifiedAdminDashboard;