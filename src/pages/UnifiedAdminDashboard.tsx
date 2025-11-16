import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UnifiedWorkflowManager } from '@/components/admin/UnifiedWorkflowManager';
import { AdminChangeManagement } from '@/components/admin/AdminChangeManagement';
import { PaymentProcessingDashboard } from '@/components/admin/PaymentProcessingDashboard';
import { EventTimelineManager } from '@/components/admin/EventTimelineManager';
import { TestExecutionPanel } from '@/components/admin/TestExecutionPanel';
import { TestingDashboard } from '@/components/admin/testing/TestingDashboard';
import { EventStatusBoard } from '@/components/admin/EventStatusBoard';
import { DocumentManagementPanel } from '@/components/admin/DocumentManagementPanel';
import { EventPipelineBoard } from '@/components/admin/EventPipelineBoard';
import { AtRiskEventsPanel } from '@/components/admin/AtRiskEventsPanel';
import { TodaysEventsPanel } from '@/components/admin/TodaysEventsPanel';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, Kanban, AlertTriangle, CalendarClock, LayoutDashboard, FileText, CreditCard, CalendarDays, FolderOpen, Wrench } from 'lucide-react';
import { EdgeFunctionTester } from '@/components/admin/EdgeFunctionTester';

type AdminView = 'workflow' | 'pipeline' | 'at-risk' | 'today' | 'event-board' | 'events' | 'change-management' | 'payments' | 'documents' | 'testing';

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
            
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button
                variant={currentView === 'workflow' ? 'default' : 'outline'}
                onClick={() => handleViewChange('workflow')}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Workflow</span>
              </Button>
              <Button
                variant={currentView === 'pipeline' ? 'default' : 'outline'}
                onClick={() => handleViewChange('pipeline')}
                size="sm"
                className="gap-2"
              >
                <Kanban className="h-4 w-4" />
                <span className="hidden lg:inline">Pipeline</span>
              </Button>
              <Button
                variant={currentView === 'at-risk' ? 'default' : 'outline'}
                onClick={() => handleViewChange('at-risk')}
                size="sm"
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden lg:inline">At-Risk</span>
              </Button>
              <Button
                variant={currentView === 'today' ? 'default' : 'outline'}
                onClick={() => handleViewChange('today')}
                size="sm"
                className="gap-2"
              >
                <CalendarClock className="h-4 w-4" />
                <span className="hidden lg:inline">Today</span>
              </Button>
              <Button
                variant={currentView === 'event-board' ? 'default' : 'outline'}
                onClick={() => handleViewChange('event-board')}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Status</span>
              </Button>
              <Button
                variant={currentView === 'events' ? 'default' : 'outline'}
                onClick={() => handleViewChange('events')}
                size="sm"
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden lg:inline">Timeline</span>
              </Button>
              <Button
                variant={currentView === 'change-management' ? 'default' : 'outline'}
                onClick={() => handleViewChange('change-management')}
                size="sm"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Changes</span>
              </Button>
              <Button
                variant={currentView === 'payments' ? 'default' : 'outline'}
                onClick={() => handleViewChange('payments')}
                size="sm"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden lg:inline">Payments</span>
              </Button>
              <Button
                variant={currentView === 'documents' ? 'default' : 'outline'}
                onClick={() => handleViewChange('documents')}
                size="sm"
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden lg:inline">Docs</span>
              </Button>
              <Button
                variant={currentView === 'testing' ? 'default' : 'outline'}
                onClick={() => handleViewChange('testing')}
                size="sm"
                className="gap-2"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden lg:inline">Testing</span>
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
          <div className="container mx-auto px-4 py-6">
            <UnifiedWorkflowManager />
          </div>
        )}
        {currentView === 'pipeline' && (
          <div className="container mx-auto px-4 py-6">
            <EventPipelineBoard />
          </div>
        )}
        {currentView === 'at-risk' && (
          <div className="container mx-auto px-4 py-6">
            <AtRiskEventsPanel />
          </div>
        )}
        {currentView === 'today' && (
          <div className="container mx-auto px-4 py-6">
            <TodaysEventsPanel />
          </div>
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
        {currentView === 'change-management' && (
          <AdminChangeManagement />
        )}
        {currentView === 'payments' && (
          <PaymentProcessingDashboard />
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