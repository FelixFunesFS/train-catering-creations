import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, 
  Smartphone, 
  Send, 
  RefreshCw,
  Mail,
  Loader2,
  Database,
  FileText
} from "lucide-react";
import { EmailTypeSelector, type EmailType, EMAIL_STAGES } from "./EmailTypeSelector";

type ViewportSize = 'desktop' | 'mobile';

interface QuoteOption {
  id: string;
  label: string;
  event_name: string;
  contact_name: string;
  event_date: string;
}

export function EmailTemplatePreview() {
  const [selectedType, setSelectedType] = useState<EmailType>('estimate_ready');
  const [selectedVariant, setSelectedVariant] = useState<'customer' | 'admin'>('customer');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Real Event Preview mode
  const [useRealEvent, setUseRealEvent] = useState(false);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Fetch available quotes for real event preview
  useEffect(() => {
    if (useRealEvent && quoteOptions.length === 0) {
      fetchQuoteOptions();
    }
  }, [useRealEvent]);

  // Fetch preview when type, variant, or quote changes
  useEffect(() => {
    fetchPreview();
  }, [selectedType, selectedVariant, useRealEvent, selectedQuoteId]);

  const fetchQuoteOptions = async () => {
    setIsLoadingQuotes(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('id, event_name, contact_name, event_date')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const options: QuoteOption[] = (data || []).map((q) => ({
        id: q.id,
        label: `${q.event_name} - ${q.contact_name}`,
        event_name: q.event_name,
        contact_name: q.contact_name,
        event_date: q.event_date,
      }));

      setQuoteOptions(options);
      if (options.length > 0 && !selectedQuoteId) {
        setSelectedQuoteId(options[0].id);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const fetchPreview = async () => {
    // For real event mode, require a quote to be selected
    if (useRealEvent && !selectedQuoteId) {
      return;
    }

    setIsLoading(true);
    try {
      if (useRealEvent && selectedQuoteId) {
        // Use send-customer-portal-email with preview_only for real data
        const { data, error } = await supabase.functions.invoke('send-customer-portal-email', {
          body: { 
            quote_request_id: selectedQuoteId,
            type: selectedType,
            preview_only: true
          }
        });

        if (error) throw error;

        setPreviewHtml(data.html || '');
        setPreviewSubject(data.subject || '');
      } else {
        // Use preview-email with sample data
        const { data, error } = await supabase.functions.invoke('preview-email', {
          body: { emailType: selectedType, variant: selectedVariant }
        });

        if (error) throw error;

        setPreviewHtml(data.html || '');
        setPreviewSubject(data.subject || '');
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error('Failed to load email preview');
      setPreviewHtml('');
      setPreviewSubject('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    const testEmailRecipient = 'soultrainseatery@gmail.com';
    try {
      if (useRealEvent && selectedQuoteId) {
        // Send real email via send-customer-portal-email
        const { error } = await supabase.functions.invoke('send-customer-portal-email', {
          body: {
            quote_request_id: selectedQuoteId,
            type: selectedType,
            override_email: testEmailRecipient,
          }
        });
        if (error) throw error;
      } else {
        // Send sample email via send-test-email
        const { error } = await supabase.functions.invoke('send-test-email', {
          body: {
            toEmail: testEmailRecipient,
            emailType: selectedType,
            variant: selectedVariant,
          }
        });
        if (error) throw error;
      }

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

  const selectedQuote = quoteOptions.find(q => q.id === selectedQuoteId);

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
                {useRealEvent && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    <Database className="h-3 w-3 mr-1" />
                    Real Data
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Real Event Preview toggle */}
                <div className="flex items-center gap-2 mr-3 pr-3 border-r">
                  <Switch
                    id="real-event-mode"
                    checked={useRealEvent}
                    onCheckedChange={setUseRealEvent}
                  />
                  <Label htmlFor="real-event-mode" className="text-sm">
                    Real Event
                  </Label>
                </div>

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

            {/* Real Event Selector */}
            {useRealEvent && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={selectedQuoteId} 
                    onValueChange={setSelectedQuoteId}
                    disabled={isLoadingQuotes}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={isLoadingQuotes ? "Loading events..." : "Select an event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {quoteOptions.map((quote) => (
                        <SelectItem key={quote.id} value={quote.id}>
                          <span className="font-medium">{quote.event_name}</span>
                          <span className="text-muted-foreground ml-2">— {quote.contact_name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedQuote && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedQuote.event_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

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
