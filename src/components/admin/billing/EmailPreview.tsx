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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {isResend ? 'Resend Estimate' : 'Email Preview'} - Exact Customer View
          </DialogTitle>
        </DialogHeader>

        {/* Email Preview Container */}
        <div className="flex-1 overflow-hidden mx-6 mb-4">
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
                className="w-full h-full min-h-[500px] bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Recipient Selection */}
        <div className="mx-6 mb-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recipient</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="alternate-email" className="text-sm text-muted-foreground">
                Send to different email
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
              This email will be sent to: <strong>{invoice.email}</strong>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 pt-0 flex-shrink-0 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {isResend && <span className="text-amber-600 font-medium mr-2">↻ Resending</span>}
            Sending to: <strong>{recipientEmail}</strong>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSend} 
              disabled={isSending || isLoading || !!error || !canSend}
            >
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              {isResend ? 'Resend Estimate' : 'Confirm & Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}