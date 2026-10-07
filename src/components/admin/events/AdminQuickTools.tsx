import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, Users } from 'lucide-react';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';

const SITE_URL = 'https://www.soultrainseatery.com';

export function buildPortalUrl(token?: string | null) {
  return token ? `${SITE_URL}/estimate?token=${token}` : '';
}

export function CopyPortalLinkButton({ token }: { token?: string | null }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  if (!token) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPortalUrl(token));
      setCopied(true);
      toast({ title: 'Portal link copied', description: 'Paste it into a text or email to the customer.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy', description: buildPortalUrl(token), variant: 'destructive' });
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy Portal Link'}
    </Button>
  );
}

/** Sum of package + vegetarian portions on the invoice, or null if no package line exists. */
export function computeLineItemHeadcount(lineItems: any[] = []) {
  const isVeg = (li: any) => /vegetarian/i.test(`${li.title ?? ''}`) ;
  const pkg = lineItems.filter(li => li.category === 'package' && !isVeg(li));
  if (pkg.length === 0) return null;
  const packageQty = pkg.reduce((s, li) => s + (li.quantity || 0), 0);
  const vegQty = lineItems.filter(isVeg).reduce((s, li) => s + (li.quantity || 0), 0);
  return { packageQty, vegQty, total: packageQty + vegQty };
}

export function GuestCountSyncBanner({ quote, lineItems }: { quote: any; lineItems: any[] }) {
  const updateQuote = useUpdateQuote();
  const counts = computeLineItemHeadcount(lineItems);
  if (!quote?.id || !counts || counts.total === quote.guest_count) return null;

  const handleSync = () =>
    updateQuote.mutateAsync({
      quoteId: quote.id,
      updates: {
        guest_count: counts.total,
        ...(counts.vegQty > 0 ? { guest_count_with_restrictions: String(counts.vegQty) } : {}),
      },
    });

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm flex flex-col sm:flex-row sm:items-center gap-3">
      <Users className="h-4 w-4 text-primary flex-shrink-0" />
      <p className="flex-1">
        Line items total <strong>{counts.total}</strong> portions ({counts.packageQty} package
        {counts.vegQty > 0 && ` + ${counts.vegQty} vegetarian`}), but the event headcount is{' '}
        <strong>{quote.guest_count}</strong>.
      </p>
      <Button size="sm" onClick={handleSync} disabled={updateQuote.isPending}>
        Sync headcount to {counts.total}
      </Button>
    </div>
  );
}
