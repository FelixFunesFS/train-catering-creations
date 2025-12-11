import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, FolderOpen, Mail } from 'lucide-react';
import { EnhancedTestingDashboard } from '../testing/EnhancedTestingDashboard';
import { DocumentManagementPanel } from '../DocumentManagementPanel';
import { EmailTemplateEditor } from '../settings/EmailTemplateEditor';

type SettingsTab = 'emails' | 'testing' | 'documents';

export function SettingsHub() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('emails');

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email Templates</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="mt-0">
          <EmailTemplateEditor />
        </TabsContent>

        <TabsContent value="testing" className="mt-0">
          <EnhancedTestingDashboard />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <DocumentManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
