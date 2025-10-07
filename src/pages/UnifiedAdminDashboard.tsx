import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StreamlinedWorkflowDashboard } from '@/components/admin/StreamlinedWorkflowDashboard';
import { AdminChangeManagement } from '@/components/admin/AdminChangeManagement';
import { PaymentProcessingDashboard } from '@/components/admin/PaymentProcessingDashboard';
import { EventTimelineManager } from '@/components/admin/EventTimelineManager';
import { TestExecutionPanel } from '@/components/admin/TestExecutionPanel';
import { TestingDashboard } from '@/components/admin/testing/TestingDashboard';
import { EventStatusBoard } from '@/components/admin/EventStatusBoard';
import { DocumentManagementPanel } from '@/components/admin/DocumentManagementPanel';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { EdgeFunctionTester } from '@/components/admin/EdgeFunctionTester';

type AdminView = 'workflow' | 'change-management' | 'payments' | 'events' | 'testing' | 'event-board' | 'documents';

export function UnifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const [currentView, setCurrentView] = useState<AdminView>(viewParam || 'workflow');
  const { signOut } = useAuth();

  // Sync URL with view state
  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    setSearchParams({ view });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Soul Train's Eatery Admin</h1>
              <p className="text-sm text-muted-foreground">Streamlined request management</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={currentView === 'workflow' ? 'default' : 'outline'}
                onClick={() => handleViewChange('workflow')}
              >
                Streamlined Workflow
              </Button>
              <Button
                variant={currentView === 'change-management' ? 'default' : 'outline'}
                onClick={() => handleViewChange('change-management')}
              >
                Change Requests
              </Button>
              <Button
                variant={currentView === 'payments' ? 'default' : 'outline'}
                onClick={() => handleViewChange('payments')}
              >
                Payment Processing
              </Button>
              <Button
                variant={currentView === 'event-board' ? 'default' : 'outline'}
                onClick={() => handleViewChange('event-board')}
              >
                Event Status
              </Button>
              <Button
                variant={currentView === 'events' ? 'default' : 'outline'}
                onClick={() => handleViewChange('events')}
              >
                Event Timeline
              </Button>
              <Button
                variant={currentView === 'documents' ? 'default' : 'outline'}
                onClick={() => handleViewChange('documents')}
              >
                Documents
              </Button>
              <Button
                variant={currentView === 'testing' ? 'default' : 'outline'}
                onClick={() => handleViewChange('testing')}
              >
                Testing
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'workflow' && (
          <StreamlinedWorkflowDashboard onBack={() => setCurrentView('workflow')} />
        )}
        {currentView === 'change-management' && (
          <AdminChangeManagement />
        )}
        {currentView === 'payments' && (
          <PaymentProcessingDashboard />
        )}
        {currentView === 'event-board' && (
          <div className="container mx-auto px-4 py-6">
            <EventStatusBoard />
          </div>
        )}
        {currentView === 'events' && (
          <div className="container mx-auto px-4 py-6">
            <EventTimelineManager />
          </div>
        )}
        {currentView === 'documents' && (
          <div className="container mx-auto px-4 py-6">
            <DocumentManagementPanel />
          </div>
        )}
        {currentView === 'testing' && (
          <div className="container mx-auto px-4 py-6 space-y-6">
            <EdgeFunctionTester />
            <TestingDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedAdminDashboard;