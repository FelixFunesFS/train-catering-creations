import { useState, useEffect } from 'react';
import { Lightbulb, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { viewHelpTips } from './helpContent';

interface ViewHelpCardProps {
  viewKey: string;
}

export function ViewHelpCard({ viewKey }: ViewHelpCardProps) {
  const storageKey = `admin-help-dismissed-${viewKey}`;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    // Default to collapsed if never set
    return stored === null ? true : stored === 'true';
  });

  const tips = viewHelpTips[viewKey];

  useEffect(() => {
    localStorage.setItem(storageKey, String(isCollapsed));
  }, [isCollapsed, storageKey]);

  if (!tips) return null;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        <span>Show tips</span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4 mb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Quick Tips</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary/60 mt-0.5">•</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
