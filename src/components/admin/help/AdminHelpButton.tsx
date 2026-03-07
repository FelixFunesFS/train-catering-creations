import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminHelpDialog } from './AdminHelpDialog';

export function AdminHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
        aria-label="Help"
      >
        <CircleHelp className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>
      <AdminHelpDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
