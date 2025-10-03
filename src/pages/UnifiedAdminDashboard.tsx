import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StreamlinedWorkflowDashboard } from '@/components/admin/StreamlinedWorkflowDashboard';
import { AdminChangeManagement } from '@/components/admin/AdminChangeManagement';
import { PaymentProcessingDashboard } from '@/components/admin/PaymentProcessingDashboard';
import { EventTimelineManager } from '@/components/admin/EventTimelineManager';
import { TestExecutionPanel } from '@/components/admin/TestExecutionPanel';
import { TestingDashboard } from '@/components/admin/testing/TestingDashboard';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

type AdminView = 'workflow' | 'change-management' | 'payments' | 'events' | 'testing';

export function UnifiedAdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('workflow');
  const { signOut } = useAuth();

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
                onClick={() => setCurrentView('workflow')}
              >
                Streamlined Workflow
              </Button>
              <Button
                variant={currentView === 'change-management' ? 'default' : 'outline'}
                onClick={() => setCurrentView('change-management')}
              >
                Change Requests
              </Button>
              <Button
                variant={currentView === 'payments' ? 'default' : 'outline'}
                onClick={() => setCurrentView('payments')}
              >
                Payment Processing
              </Button>
              <Button
                variant={currentView === 'events' ? 'default' : 'outline'}
                onClick={() => setCurrentView('events')}
              >
                Event Timeline
              </Button>
              <Button
                variant={currentView === 'testing' ? 'default' : 'outline'}
                onClick={() => setCurrentView('testing')}
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
        {currentView === 'events' && (
          <div className="container mx-auto px-4 py-6">
            <EventTimelineManager />
          </div>
        )}
        {currentView === 'testing' && (
          <div className="container mx-auto px-4 py-6">
            <TestingDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedAdminDashboard;