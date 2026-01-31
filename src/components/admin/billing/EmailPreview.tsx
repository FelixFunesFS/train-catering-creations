import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InvoicePaymentSummary } from '@/services/PaymentDataService';
import { Eye, Send, Loader2, X, RefreshCw, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailPreviewProps {
  invoice: InvoicePaymentSummary;
  onClose: () => void;
  onConfirmSend: (overrideEmail?: string) => void;
  isSending: boolean;
  isResend?: boolean;
}

export function EmailPreview({
  invoice,
  onClose,
  onConfirmSend,
  isSending,
  isResend = false,
}: EmailPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useAlternateEmail, setUseAlternateEmail] = useState(false);
  const [alternateEmail, setAlternateEmail] = useState('');

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const recipientEmail = useAlternateEmail && alternateEmail ? alternateEmail : invoice.email;
  const canSend = !useAlternateEmail || isValidEmail(alternateEmail);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-customer-portal-email', {
        body: {
          quote_request_id: invoice.quote_id,
          type: 'estimate_ready',
          preview_only: true
        }
      });

      if (invokeError) throw invokeError;
      
      if (data?.html) {
        setPreviewHtml(data.html);
      } else {
        throw new Error('No HTML returned from preview');
      }
    } catch (err: any) {
      console.error('Failed to fetch email preview:', err);
      setError(err.message || 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [invoice.quote_id]);

  const handleConfirmSend = () => {
    onConfirmSend(useAlternateEmail ? alternateEmail : undefined);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">
              {isResend ? 'Resend Estimate' : 'Email Preview'}
              <span className="hidden sm:inline"> - Exact Customer View</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Email Preview Container */}
        <div className="flex-1 overflow-hidden mx-4 sm:mx-6 mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading email preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-destructive/10">
              <div className="text-center p-4">
                <p className="text-destructive font-medium mb-2">Failed to load preview</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchPreview}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden h-full">
              <iframe
                srcDoc={previewHtml || ''}
                className="w-full h-full min-h-[300px] sm:min-h-[500px] bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Recipient Selection */}
        <div className="mx-4 sm:mx-6 mb-4 p-3 sm:p-4 bg-muted/30 rounded-lg border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recipient</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="alternate-email" className="text-xs sm:text-sm text-muted-foreground">
                <span className="sm:hidden">Different email</span>
                <span className="hidden sm:inline">Send to different email</span>
              </Label>
              <Switch
                id="alternate-email"
                checked={useAlternateEmail}
                onCheckedChange={setUseAlternateEmail}
              />
            </div>
          </div>
          
          {useAlternateEmail ? (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter alternate email address"
                value={alternateEmail}
                onChange={(e) => setAlternateEmail(e.target.value)}
                className={!canSend && alternateEmail ? 'border-destructive' : ''}
              />
              {!canSend && alternateEmail && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
              <p className="text-xs text-muted-foreground">
                Original recipient: {invoice.email}
              </p>
            </div>
          ) : (
            <p className="text-sm">
              This email will be sent to: <strong className="break-all">{invoice.email}</strong>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 pt-3 sm:pt-0 flex-shrink-0 border-t bg-muted/30">
          {/* Recipient info - full width on mobile */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {isResend && <span className="text-amber-600 font-medium mr-1 sm:mr-2">↻</span>}
            <span className="hidden sm:inline">Sending to: </span>
            <strong className="break-all">{recipientEmail}</strong>
          </p>
          
          {/* Buttons - stack on mobile, row on desktop */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSend} 
              disabled={isSending || isLoading || !!error || !canSend}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              <span className="sm:hidden">{isResend ? 'Resend' : 'Send'}</span>
              <span className="hidden sm:inline">{isResend ? 'Resend Estimate' : 'Confirm & Send'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
