import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Save, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Send,
  Bell,
  CreditCard,
  Calendar,
  MessageSquare,
  AlertCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  body_template: string;
  is_default: boolean;
  updated_at: string;
}

// Template metadata for categorization and display
const TEMPLATE_METADATA: Record<string, { 
  icon: React.ReactNode; 
  category: 'automated' | 'manual';
  trigger: string;
  description: string;
}> = {
  quote_confirmation: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Customer submits quote form',
    description: 'Sent immediately when a customer submits a quote request'
  },
  admin_notification: {
    icon: <Bell className="h-4 w-4" />,
    category: 'automated',
    trigger: 'New quote received',
    description: 'Alert sent to admin when new quote is submitted'
  },
  estimate_ready: {
    icon: <Send className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Admin sends estimate',
    description: 'Sent when admin clicks "Send Estimate" to customer'
  },
  approval_confirmation: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Customer approves estimate',
    description: 'Confirmation when customer approves their estimate'
  },
  payment_reminder: {
    icon: <Clock className="h-4 w-4" />,
    category: 'automated',
    trigger: '3 days before payment due',
    description: 'Automated reminder before payment milestone is due'
  },
  payment_confirmation: {
    icon: <CreditCard className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Payment received via Stripe',
    description: 'Receipt sent after successful payment'
  },
  event_reminder: {
    icon: <Calendar className="h-4 w-4" />,
    category: 'automated',
    trigger: '3 days before event',
    description: 'Final reminder before the catering event'
  },
  post_event_followup: {
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Day after event',
    description: 'Thank you email requesting feedback'
  },
  custom_response: {
    icon: <Mail className="h-4 w-4" />,
    category: 'manual',
    trigger: 'Admin sends manually',
    description: 'Template for custom admin-to-customer communications'
  },
  change_request_response: {
    icon: <AlertCircle className="h-4 w-4" />,
    category: 'automated',
    trigger: 'Admin responds to change request',
    description: 'Response to customer change request'
  }
};

// Available template variables
const TEMPLATE_VARIABLES = [
  { key: 'customer_name', description: 'Customer full name' },
  { key: 'customer_email', description: 'Customer email address' },
  { key: 'customer_phone', description: 'Customer phone number' },
  { key: 'event_name', description: 'Name of the event' },
  { key: 'event_date', description: 'Formatted event date' },
  { key: 'event_time', description: 'Event start time' },
  { key: 'location', description: 'Event venue/location' },
  { key: 'guest_count', description: 'Number of guests' },
  { key: 'service_type', description: 'Service type (Full-Service, etc.)' },
  { key: 'total_amount', description: 'Total invoice amount' },
  { key: 'amount_due', description: 'Current amount due' },
  { key: 'amount_paid', description: 'Amount just paid' },
  { key: 'due_date', description: 'Payment due date' },
  { key: 'portal_link', description: 'Customer portal access link' },
  { key: 'admin_link', description: 'Admin dashboard link' },
  { key: 'support_phone', description: 'Business phone: (843) 970-0265' },
  { key: 'support_email', description: 'Business email' },
  { key: 'custom_message', description: 'Admin custom message (manual only)' },
  { key: 'admin_response', description: 'Admin response text' },
  { key: 'payment_status_message', description: 'Payment status context' },
  { key: 'arrival_time', description: 'Team arrival time for setup' }
];

export const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'automated' | 'manual'>('automated');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setHasChanges(
        editedSubject !== selectedTemplate.subject_template ||
        editedBody !== selectedTemplate.body_template
      );
    }
  }, [editedSubject, editedBody, selectedTemplate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_type');

    if (error) {
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setTemplates(data || []);
      // Auto-select first template
      if (data && data.length > 0 && !selectedTemplate) {
        handleSelectTemplate(data[0]);
      }
    }
    setIsLoading(false);
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    if (hasChanges) {
      const confirmSwitch = window.confirm("You have unsaved changes. Discard and switch templates?");
      if (!confirmSwitch) return;
    }
    setSelectedTemplate(template);
    setEditedSubject(template.subject_template);
    setEditedBody(template.body_template);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('email_templates')
      .update({
        subject_template: editedSubject,
        body_template: editedBody,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedTemplate.id);

    if (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Template saved",
        description: `${selectedTemplate.template_name} updated successfully`
      });
      setHasChanges(false);
      // Refresh templates
      loadTemplates();
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (!selectedTemplate) return;
    setEditedSubject(selectedTemplate.subject_template);
    setEditedBody(selectedTemplate.body_template);
    setHasChanges(false);
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{${variable}}`;
    setEditedBody(prev => prev + placeholder);
  };

  const filteredTemplates = templates.filter(t => {
    const meta = TEMPLATE_METADATA[t.template_type];
    return meta?.category === activeTab;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Editor
          </CardTitle>
          <CardDescription>
            Customize automated and manual email templates. All emails use your brand styling automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'automated' | 'manual')}>
            <TabsList className="mb-4">
              <TabsTrigger value="automated" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Automated Emails
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Manual Templates
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template List */}
              <div className="lg:col-span-1">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {filteredTemplates.map((template) => {
                      const meta = TEMPLATE_METADATA[template.template_type];
                      const isSelected = selectedTemplate?.id === template.id;
                      
                      return (
                        <div
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {meta?.icon || <Mail className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{template.template_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{meta?.trigger}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Editor */}
              <div className="lg:col-span-2 space-y-4">
                {selectedTemplate ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedTemplate.template_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {TEMPLATE_METADATA[selectedTemplate.template_type]?.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={hasChanges ? "default" : "secondary"}>
                          {hasChanges ? "Unsaved changes" : "Saved"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Subject Line</label>
                        <Input
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          placeholder="Email subject..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Email Body</label>
                        <Textarea
                          value={editedBody}
                          onChange={(e) => setEditedBody(e.target.value)}
                          rows={12}
                          className="font-mono text-sm"
                          placeholder="Email content..."
                        />
                      </div>

                      {/* Variable Reference */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">Available Variables (click to insert)</p>
                        <div className="flex flex-wrap gap-2">
                          {TEMPLATE_VARIABLES.map((v) => (
                            <button
                              key={v.key}
                              onClick={() => insertVariable(v.key)}
                              className="px-2 py-1 text-xs bg-background border rounded hover:bg-primary hover:text-primary-foreground transition-colors"
                              title={v.description}
                            >
                              {`{${v.key}}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Select a template to edit
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Workflow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Workflow Triggers</CardTitle>
          <CardDescription>
            When each email is automatically sent during the customer journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TEMPLATE_METADATA)
              .filter(([_, meta]) => meta.category === 'automated')
              .map(([type, meta]) => (
                <div key={type} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-primary/10 rounded text-primary">
                      {meta.icon}
                    </div>
                    <span className="font-medium text-sm capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{meta.trigger}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
