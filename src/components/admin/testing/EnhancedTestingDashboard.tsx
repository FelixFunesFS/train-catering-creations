import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestingDashboard } from './TestingDashboard';
import { WorkflowTestRunner } from './WorkflowTestRunner';
import { DataIntegrityChecker } from './DataIntegrityChecker';
import { EdgeFunctionMonitor } from './EdgeFunctionMonitor';
import { 
  Play, 
  GitBranch, 
  Database, 
  Zap,
  ClipboardCheck
} from 'lucide-react';

export function EnhancedTestingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">MVP Validation Center</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and validation for production readiness
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Tests</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="integrity" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data Integrity</span>
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Edge Functions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <TestingDashboard />
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowTestRunner />
        </TabsContent>

        <TabsContent value="integrity" className="mt-6">
          <DataIntegrityChecker />
        </TabsContent>

        <TabsContent value="functions" className="mt-6">
          <EdgeFunctionMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
