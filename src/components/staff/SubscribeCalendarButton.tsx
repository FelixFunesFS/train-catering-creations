import { useState } from 'react';
import { CalendarSync, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const STAFF_TOKEN = 'soul-trains-staff-2024';
const SUPABASE_URL = 'https://qptprrqjlcvfkhfdnnoa.supabase.co';

export function SubscribeCalendarButton({ variant = 'default' }: { variant?: 'default' | 'icon' }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Generate URLs for different platforms
  const httpsUrl = `${SUPABASE_URL}/functions/v1/staff-calendar-feed?token=${STAFF_TOKEN}`;
  const webcalUrl = httpsUrl.replace('https://', 'webcal://');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      toast.success('Calendar URL copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleSubscribe = () => {
    // For iOS/macOS, webcal:// opens directly in Calendar app
    // For Android/others, we show the dialog with instructions
    const isApple = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);
    
    if (isApple) {
      window.location.href = webcalUrl;
      toast.success('Opening Calendar app...');
    } else {
      setOpen(true);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSubscribe}
          className="h-11 w-11 min-w-[44px] min-h-[44px]"
          aria-label="Subscribe to calendar"
        >
          <CalendarSync className="h-5 w-5" />
        </Button>
        <SubscribeDialog 
          open={open} 
          onOpenChange={setOpen} 
          httpsUrl={httpsUrl}
          webcalUrl={webcalUrl}
          onCopy={handleCopy}
          copied={copied}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleSubscribe}
        className="h-11 min-w-[44px] gap-2"
      >
        <CalendarSync className="h-4 w-4" />
        <span className="hidden sm:inline">Subscribe to Calendar</span>
        <span className="sm:hidden">Subscribe</span>
      </Button>
      <SubscribeDialog 
        open={open} 
        onOpenChange={setOpen} 
        httpsUrl={httpsUrl}
        webcalUrl={webcalUrl}
        onCopy={handleCopy}
        copied={copied}
      />
    </>
  );
}

function SubscribeDialog({ 
  open, 
  onOpenChange, 
  httpsUrl,
  webcalUrl,
  onCopy,
  copied 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  httpsUrl: string;
  webcalUrl: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarSync className="h-5 w-5 text-primary" />
            Subscribe to Staff Schedule
          </DialogTitle>
          <DialogDescription>
            Add this calendar to sync all upcoming events automatically. Changes and new events will appear within a few hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Google Calendar Instructions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Google Calendar</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open Google Calendar on web</li>
              <li>Click "+" next to "Other calendars"</li>
              <li>Select "From URL"</li>
              <li>Paste the URL below and click "Add calendar"</li>
            </ol>
          </div>

          {/* Apple Calendar Instructions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Apple Calendar (iPhone/Mac)</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = webcalUrl}
            >
              <ExternalLink className="h-4 w-4" />
              Open in Calendar App
            </Button>
          </div>

          {/* URL Copy Section */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Calendar URL</h4>
            <div className="flex gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                {httpsUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={onCopy}
                className="shrink-0 h-10 w-10"
              >
              {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            ⏱️ Calendar apps typically refresh every 1-12 hours. Event updates, cancellations, and new bookings will sync automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
