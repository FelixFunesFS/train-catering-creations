import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  );
}
