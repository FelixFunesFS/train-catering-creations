import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Show banner after 2nd page view
    const pageViews = parseInt(localStorage.getItem('pwa-page-views') || '0', 10) + 1;
    localStorage.setItem('pwa-page-views', pageViews.toString());

    if (pageViews >= 2 && (isInstallable || isIOS) && !isInstalled) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isIOS, isInstalled]);

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      // Can't programmatically trigger on iOS, show instructions
      window.location.href = '/install';
    } else {
      const success = await promptInstall();
      if (success) {
        setShowBanner(false);
      }
    }
  };

  if (!showBanner || isDismissed || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <img 
              src="/favicon.svg" 
              alt="Soul Train's Eatery" 
              className="w-6 h-6"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">Install Soul Train's</p>
            <p className="text-xs text-muted-foreground truncate">
              {isIOS ? 'Add to Home Screen for quick access' : 'Install for faster access'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleInstall}
            className="gap-1.5"
          >
            {isIOS ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">{isIOS ? 'How to Install' : 'Install'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
