import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Monitor, Tablet, Smartphone, Send, RefreshCw, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseEmailTemplate } from '@/utils/emailTemplateParser';

interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  body_template: string;
}

const DEVICE_SIZES = {
  mobile: { width: 375, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, label: 'Tablet', icon: Tablet },
  desktop: { width: 600, label: 'Desktop', icon: Monitor },
};

const SAMPLE_DATA = {
  customer_name: 'John Smith',
  event_name: 'Smith Wedding Reception',
  event_date: 'Saturday, March 15, 2025',
  event_time: '5:00 PM',
  guest_count: '150',
  location: 'Charleston Waterfront Pavilion',
  service_type: 'Full-Service Catering',
  portal_link: 'https://example.com/estimate?token=sample-token',
  total_amount: '$3,500.00',
  deposit_amount: '$1,750.00',
  balance_due: '$1,750.00',
  payment_due_date: 'March 8, 2025',
  invoice_number: 'INV-2025-0042',
  admin_response: 'We have reviewed your request and made the following adjustments to accommodate your dietary requirements.',
  cost_change: '+$150.00',
  reference_id: 'ABC12345',
};

export const EmailPreviewStudio: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHtml = (template: EmailTemplate): string => {
    const parsedSubject = parseEmailTemplate(template.subject_template, SAMPLE_DATA);
    const parsedBody = parseEmailTemplate(template.body_template, SAMPLE_DATA);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${parsedSubject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-container {
            background: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #DC143C, #B01030);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #FFD700;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 3px solid #FFD700;
          }
          .btn {
            display: inline-block;
            padding: 14px 28px;
            background: #DC143C;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 5px;
          }
          .event-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #FFD700;
            margin: 20px 0;
          }
          h2, h3 { color: #DC143C; }
          @media (max-width: 480px) {
            .btn { display: block; width: 100%; margin: 10px 0; }
            .content { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🚂 Soul Train's Eatery</h1>
            <p style="margin-top: 8px; opacity: 0.9;">Bringing people together around exceptional food</p>
          </div>
          <div class="content">
            ${parsedBody}
          </div>
          <div class="footer">
            <p><strong>Soul Train's Eatery</strong></p>
            <p>Charleston's Trusted Catering Partner</p>
            <p style="margin-top: 10px;">(843) 970-0265 | soultrainseatery@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please select a template and enter a test email address',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const parsedSubject = parseEmailTemplate(selectedTemplate.subject_template, SAMPLE_DATA);
      const htmlContent = generatePreviewHtml(selectedTemplate);

      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: testEmail,
          subject: `[TEST] ${parsedSubject}`,
          html: htmlContent,
          from: `Soul Train's Eatery <soultrainseatery@gmail.com>`
        }
      });

      if (error) throw error;

      toast({
        title: 'Test Email Sent',
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Failed to Send',
        description: 'Could not send test email. Check edge function logs.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const DeviceIcon = DEVICE_SIZES[device].icon;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Template Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <Select
                value={selectedTemplate?.id || ''}
                onValueChange={(id) => {
                  const template = templates.find(t => t.id === id);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.template_type.includes('automated') ? 'secondary' : 'outline'} className="text-xs">
                          {template.template_type.includes('automated') ? 'Auto' : 'Manual'}
                        </Badge>
                        {template.template_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Toggle */}
            <div>
              <label className="text-sm font-medium mb-2 block">Device Preview</label>
              <div className="flex border rounded-lg overflow-hidden">
                {(Object.keys(DEVICE_SIZES) as Array<keyof typeof DEVICE_SIZES>).map((key) => {
                  const Icon = DEVICE_SIZES[key].icon;
                  return (
                    <Button
                      key={key}
                      variant={device === key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDevice(key)}
                      className="rounded-none"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {DEVICE_SIZES[key].label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Test Email */}
          <div className="flex gap-2 items-end pt-4 border-t">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Send Test Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={sendTestEmail} disabled={sending || !selectedTemplate}>
              {sending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      {selectedTemplate && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTemplate.template_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Subject:</span>{' '}
                  {parseEmailTemplate(selectedTemplate.subject_template, SAMPLE_DATA)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {DEVICE_SIZES[device].width}px
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-muted/30">
            <div 
              className="mx-auto transition-all duration-300 bg-background shadow-lg"
              style={{ 
                width: device === 'desktop' ? '100%' : `${DEVICE_SIZES[device].width}px`,
                maxWidth: '100%'
              }}
            >
              <iframe
                srcDoc={generatePreviewHtml(selectedTemplate)}
                title="Email Preview"
                className="w-full border-0"
                style={{ 
                  height: '700px',
                  minHeight: '500px'
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Sample Data Used for Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            {Object.entries(SAMPLE_DATA).map(([key, value]) => (
              <div key={key} className="bg-muted/50 p-2 rounded">
                <span className="font-mono text-xs text-muted-foreground">{`{${key}}`}</span>
                <p className="text-xs truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
