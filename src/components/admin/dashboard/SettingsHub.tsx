import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, FolderOpen, Mail, Eye, Edit } from 'lucide-react';
import { EnhancedTestingDashboard } from '../testing/EnhancedTestingDashboard';
import { DocumentManagementPanel } from '../DocumentManagementPanel';
import { EmailTemplateEditor } from '../settings/EmailTemplateEditor';
import { EmailPreviewStudio } from '../settings/EmailPreviewStudio';

type SettingsTab = 'emails' | 'testing' | 'documents';
type EmailSubTab = 'editor' | 'preview';

export function SettingsHub() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('emails');
  const [emailSubTab, setEmailSubTab] = useState<EmailSubTab>('editor');

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
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

        <TabsContent value="emails" className="mt-0 space-y-4">
          {/* Email Sub-Navigation */}
          <div className="flex gap-2 border-b pb-2">
            <button
              onClick={() => setEmailSubTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                emailSubTab === 'editor'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Edit className="h-4 w-4" />
              Template Editor
            </button>
            <button
              onClick={() => setEmailSubTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                emailSubTab === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview Studio
            </button>
          </div>

          {emailSubTab === 'editor' && <EmailTemplateEditor />}
          {emailSubTab === 'preview' && <EmailPreviewStudio />}
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
