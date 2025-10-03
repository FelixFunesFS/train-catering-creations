import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseEmailTemplate } from "@/utils/emailTemplateParser";

interface Template {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  template_type: string;
}

interface QuickResponseTemplatesProps {
  quoteId: string;
  customerEmail: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  onSent?: () => void;
}

export const QuickResponseTemplates = ({
  quoteId,
  customerEmail,
  customerName,
  eventName,
  eventDate,
  onSent
}: QuickResponseTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const variables = {
    customer_name: customerName,
    event_name: eventName,
    event_date: new Date(eventDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    quote_id: quoteId.slice(0, 8).toUpperCase(),
    support_phone: "(843) 970-0265",
    support_email: "soultrainseatery@gmail.com"
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'quote_response')
      .order('template_name');

    if (error) {
      console.error('Error loading templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setSubject(parseEmailTemplate(template.subject_template, variables));
    setBody(parseEmailTemplate(template.body_template, variables));
  };

  const handleSend = async () => {
    if (!subject || !body) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: customerEmail,
          subject,
          html: body.replace(/\n/g, '<br>')
        }
      });

      if (error) throw error;

      // Log message to thread
      const { data: thread } = await supabase
        .from('message_threads')
        .select('id')
        .eq('quote_request_id', quoteId)
        .single();

      if (thread) {
        await supabase.from('messages').insert({
          thread_id: thread.id,
          sender_type: 'admin',
          sender_name: 'Admin',
          sender_email: 'soultrainseatery@gmail.com',
          message_content: body,
          message_type: 'email',
          is_template_used: !!selectedTemplate,
          template_name: selectedTemplate?.template_name
        });
      }

      toast({
        title: "Email Sent",
        description: `Response sent to ${customerName}`
      });

      setSubject("");
      setBody("");
      setSelectedTemplate(null);
      onSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Quick Response
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Template</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="justify-start"
              >
                <Edit2 className="h-3 w-3 mr-2" />
                {template.template_name}
              </Button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Email subject"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Type your message here..."
          />
        </div>

        {/* Variables Reference */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs font-medium mb-2">Available Variables:</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(variables).map((key) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {`{${key}}`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSend} 
          disabled={isSending || !subject || !body}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </CardContent>
    </Card>
  );
};
