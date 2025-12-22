import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, 
  Smartphone, 
  Send, 
  RefreshCw,
  Mail,
  Loader2,
  ExternalLink
} from "lucide-react";
import { EmailTypeSelector, type EmailType, EMAIL_STAGES } from "./EmailTypeSelector";

type ViewportSize = 'desktop' | 'mobile';

export function EmailTemplatePreview() {
  const [selectedType, setSelectedType] = useState<EmailType>('estimate_ready');
  const [selectedVariant, setSelectedVariant] = useState<'customer' | 'admin'>('customer');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch preview when type or variant changes
  useEffect(() => {
    fetchPreview();
  }, [selectedType, selectedVariant]);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('preview-email', {
        body: { emailType: selectedType, variant: selectedVariant }
      });

      if (error) throw error;

      setPreviewHtml(data.html || '');
      setPreviewSubject(data.subject || '');
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error('Failed to load email preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    const testEmailRecipient = 'soultrainseatery@gmail.com';
    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: {
          toEmail: testEmailRecipient,
          emailType: selectedType,
          variant: selectedVariant,
        }
      });

      if (error) throw error;

      toast.success(`Test email sent to ${testEmailRecipient}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  const selectedEmailInfo = EMAIL_STAGES
    .flatMap(s => s.emails)
    .find(e => e.id === selectedType);

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Left sidebar - Email type selector */}
      <div className="col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)] px-4 pb-4">
              <EmailTypeSelector
                selectedType={selectedType}
                selectedVariant={selectedVariant}
                onSelectType={setSelectedType}
                onSelectVariant={setSelectedVariant}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right panel - Preview */}
      <div className="col-span-9">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">
                  {selectedEmailInfo?.label || 'Email Preview'}
                </CardTitle>
                <Badge variant={selectedVariant === 'customer' ? 'default' : 'secondary'}>
                  {selectedVariant === 'customer' ? 'Customer View' : 'Admin View'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Viewport toggle */}
                <Tabs value={viewport} onValueChange={(v) => setViewport(v as ViewportSize)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="desktop" className="h-7 px-2">
                      <Monitor className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="h-7 px-2">
                      <Smartphone className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Refresh button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchPreview}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                {/* Send test email button */}
                <Button 
                  size="sm"
                  onClick={handleSendTestEmail}
                  disabled={isSending || !previewHtml}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Test
                </Button>
              </div>
            </div>
            {previewSubject && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Subject:</strong> {previewSubject}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-4 bg-muted/30 overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-full flex justify-center overflow-auto">
                <div 
                  className={`bg-white shadow-lg transition-all duration-300 ${
                    viewport === 'mobile' 
                      ? 'w-[375px] rounded-[2rem] border-8 border-gray-800' 
                      : 'w-full max-w-[700px] rounded-lg'
                  }`}
                >
                  <iframe
                    srcDoc={previewHtml}
                    title="Email Preview"
                    className={`w-full border-0 ${
                      viewport === 'mobile' 
                        ? 'h-[600px] rounded-[1.5rem]' 
                        : 'h-full min-h-[600px]'
                    }`}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}