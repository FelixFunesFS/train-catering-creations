import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { expireStaleCheckouts } from '@/lib/staleCheckouts';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Lock, ShieldCheck, Loader2, ChevronDown, Info, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingSettings } from './PricingSettings';

type TierKey = 'competitive' | 'recommended' | 'premium';
interface Tier { items: { id: string; unit_price: number; expected_price: number; expected_quantity: number }[]; subtotal: number; perHead: number | null; flooredUp: boolean }
interface Range { id: string; title: string | null; category: string | null; quantity: number; current: number;
  range: { low: number; mid: number; high: number; sampleCount: number; limitedData: boolean } | null; comparedAcross: string }
interface PricingResponse {
  suggestion_id: string | null;
  lock: 'open' | 'unlocked' | 'guarded' | 'locked';
  guests: number; ranges: Range[]; tiers: Record<TierKey, Tier>;
  basis: { windowFrom: string; windowTo: string; group: string; sampleEvents: number; excludedOutliers: number;
    excludedDiscounted: number; appliedAdjustments: { effective_date: string }[]; upcomingAdjustment: { effective_date: string } | null; limitedData: boolean;
    delivery?: { origin: string; miles: number | null; zone: number | null; surchargeCents: number; needsReview: boolean } };
  ai?: Record<TierKey | 'summary', string> | null; aiError?: string;
}

const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const monthLabel = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const TIER_ORDER: { key: TierKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'premium', label: 'Premium' },
  { key: 'competitive', label: 'Competitive' },
];

async function callPricing(body: Record<string, unknown>): Promise<PricingResponse & { error?: string; undo_id?: string }> {
  const { data, error } = await supabase.functions.invoke('suggest-pricing', { body });
  if (error) {
    let msg = error.message;
    try { const j = await (error as any).context?.json?.(); msg = j?.error ?? msg; } catch { /* ignore */ }
    throw new Error(typeof msg === 'string' ? msg : 'Request failed');
  }
  if (body.action === 'apply') expireStaleCheckouts(body.invoice_id as string);
  return data;
}

interface Props { invoiceId: string; disabled?: boolean; disabledReason?: string; className?: string }

export function PricingAssistant({ invoiceId, disabled, disabledReason, className }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<TierKey>('recommended');
  const [confirmTier, setConfirmTier] = useState<TierKey | null>(null);
  const [confirmUnlock, setConfirmUnlock] = useState(false);
  const [applying, setApplying] = useState(false);

  const status = useQuery({
    queryKey: ['pricing-assistant', invoiceId, 'status'],
    queryFn: () => callPricing({ action: 'status', invoice_id: invoiceId }),
    enabled: !!invoiceId, staleTime: 2 * 60_000, refetchOnWindowFocus: false,
  });
  const ai = useQuery({
    queryKey: ['pricing-assistant', invoiceId, 'suggest'],
    queryFn: () => callPricing({ action: 'suggest', invoice_id: invoiceId }),
    enabled: false, staleTime: 5 * 60_000,
  });

  const data = ai.data && ai.dataUpdatedAt >= status.dataUpdatedAt ? ai.data : status.data;
  const lock = status.data?.lock;

  const refreshAll = () => {
    qc.removeQueries({ queryKey: ['pricing-assistant', invoiceId, 'suggest'] });
    qc.refetchQueries({ queryKey: ['line-items', invoiceId], type: 'active' });
    qc.invalidateQueries({ queryKey: ['line-items'] });
    qc.invalidateQueries({ queryKey: ['invoices'] });
    qc.invalidateQueries({ queryKey: ['invoices', 'detail', invoiceId] });
    qc.invalidateQueries({ queryKey: ['pricing-assistant', invoiceId] });
    qc.invalidateQueries({ queryKey: ['payment-milestones'] });
    qc.invalidateQueries({ queryKey: ['invoice', invoiceId] });
    qc.invalidateQueries({ queryKey: ['events'] });
    qc.invalidateQueries({ queryKey: ['staff-events'] });
  };

  const openDrawer = () => { setOpen(true); ai.refetch(); };

  const apply = async (tier: TierKey) => {
    if (!data || applying || disabled || ai.isFetching || !['open', 'unlocked'].includes(lock ?? '')) return;
    setApplying(true);
    try {
      const res = await callPricing({ action: 'apply', invoice_id: invoiceId, tier, suggestion_id: data.suggestion_id });
      refreshAll();
      setOpen(false);
      const undoId = res.undo_id;
      toast({
        title: `${TIER_ORDER.find((t) => t.key === tier)?.label} pricing applied`,
        description: 'Tax was not changed.',
        action: undoId ? (
          <ToastAction altText="Undo" onClick={async () => {
            try { await callPricing({ action: 'apply', invoice_id: invoiceId, tier: 'undo', suggestion_id: undoId }); refreshAll(); toast({ title: 'Prices restored' }); }
            catch (e: any) { toast({ title: 'Could not undo', description: e.message, variant: 'destructive' }); }
          }}>Undo</ToastAction>
        ) : undefined,
      });
    } catch (e: any) {
      toast({ title: 'Not applied', description: e.message, variant: 'destructive' });
      status.refetch();
    } finally { setApplying(false); setConfirmTier(null); }
  };

  const unlock = async () => {
    try { await callPricing({ action: 'unlock', invoice_id: invoiceId }); await status.refetch(); toast({ title: 'Pricing unlocked for revision' }); }
    catch (e: any) { toast({ title: 'Could not unlock', description: e.message, variant: 'destructive' }); }
    finally { setConfirmUnlock(false); }
  };

  // ---------- Entry bar ----------
  let bar: JSX.Element;
  if (status.isLoading) {
    bar = <div className="h-11 rounded-md border border-border/60 bg-muted/30 animate-pulse" />;
  } else if (lock === 'locked') {
    bar = (
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 min-h-[44px] text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0" /> Payment received - pricing frozen
      </div>
    );
  } else if (lock === 'guarded') {
    bar = (
      <Button type="button" variant="outline" onClick={() => setConfirmUnlock(true)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-3 min-h-[44px] text-sm hover:bg-muted/40">
        <span className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> Pricing locked - quote sent</span>
        <span className="font-medium text-foreground">Unlock for revision</span>
      </Button>
    );
  } else {
    bar = (
      <Button type="button" variant="outline" onClick={openDrawer} disabled={disabled || !lock}
        className="w-full min-h-[44px] justify-center gap-2 !shadow-none !bg-none bg-background border-border/70 hover:!translate-y-0">
        <Sparkles className="h-4 w-4" /> Suggest Pricing
        {lock === 'unlocked' && <span className="text-xs text-muted-foreground">(unlocked)</span>}
      </Button>
    );
  }

  const b = data?.basis;
  const tier = data?.tiers[picked];

  return (
    <div className={cn('space-y-1', className)}>
      {bar}
      {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      {status.isError && <p className="text-xs text-muted-foreground">Pricing suggestions are unavailable right now.</p>}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl p-0 md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[460px] md:rounded-none md:border-l md:border-t-0">
          <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted md:hidden" />
            <SheetTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> Pricing suggestions</SheetTitle>
            <SheetDescription className="text-xs">
              {b ? `Based on ${b.sampleEvents} events, ${monthLabel(b.windowFrom)} - ${monthLabel(b.windowTo)}` : 'Loading history...'}
              {b?.appliedAdjustments.length ? ` · ${b.appliedAdjustments.length} price change${b.appliedAdjustments.length > 1 ? 's' : ''} applied` : ''}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {!data ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/60 bg-muted/30 p-1" role="tablist" aria-label="Pricing tier">
                  {TIER_ORDER.map(({ key, label }) => {
                    const active = picked === key;
                    return (
                      <button key={key} type="button" role="tab" aria-selected={active} onClick={() => setPicked(key)}
                        className={cn('min-h-[52px] rounded-md px-1 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active ? 'bg-background text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground')}>
                        <span className="block text-xs font-medium">{label}</span>
                        <span className="block text-sm font-semibold tabular-nums">{money(data.tiers[key].subtotal).replace(/\.00$/, '')}</span>
                      </button>
                    );
                  })}
                </div>

                {tier && (
                  <div className="space-y-1" role="tabpanel">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-2xl font-semibold tabular-nums">{money(tier.subtotal)}</span>
                      <span className="text-sm text-muted-foreground">
                        {tier.perHead != null ? `${money(tier.perHead)} / guest · ` : ''}before tax
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground min-h-[1.25rem]">
                      {ai.isFetching && !data.ai ? <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Thinking it through...</span>
                        : data.ai?.[picked] ?? (tier.flooredUp ? 'Raised to meet your minimums.' : '')}
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Line items</p>
                  <div className="divide-y divide-border/60 border-y border-border/60">
                    {data.ranges.map((r) => {
                      const next = tier?.items.find((i) => i.id === r.id)?.unit_price;
                      const changed = next != null && next !== r.current;
                      const diff = changed ? next - r.current : 0;
                      return (
                        <div key={r.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{r.title || r.category || 'Item'}{r.quantity > 1 ? <span className="font-normal text-muted-foreground"> × {r.quantity}</span> : null}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.range ? `${r.range.sampleCount} past · ${money(r.range.low)}-${money(r.range.high)}` : 'No history - kept as is'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right tabular-nums">
                            <p className="font-medium">{money(next ?? r.current)}</p>
                            {changed ? (
                              <p className="text-xs text-muted-foreground"><span className="line-through">{money(r.current)}</span> {diff > 0 ? '+' : '−'}{money(Math.abs(diff))}</p>
                            ) : <p className="text-xs text-muted-foreground">Kept</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {data.ai?.summary && <p className="text-sm text-muted-foreground">{data.ai.summary}</p>}
                {ai.data?.aiError && <p className="text-xs text-muted-foreground">{ai.data.aiError} The prices above still come from your history.</p>}

                <Collapsible>
                  <CollapsibleTrigger className="group flex w-full items-center justify-between py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Data basis & delivery details <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pb-2 text-xs text-muted-foreground">
                    {b?.limitedData && (
                      <p className="flex gap-2"><Info className="h-4 w-4 shrink-0" /> Few similar past events, so these ranges are wider and less precise.</p>
                    )}
                    {b?.delivery && (
                      <p>
                        {b.delivery.zone == null
                          ? `Couldn't place the event location. Check the distance from ${b.delivery.origin} by hand.`
                          : `About ${b.delivery.miles} mi from ${b.delivery.origin} (zone ${b.delivery.zone})${b.delivery.surchargeCents > 0 ? `, ${money(b.delivery.surchargeCents)} distance charge added to delivery` : ', no distance charge'}${b.delivery.needsReview ? '. Long trip, confirm by hand.' : '.'}`}
                      </p>
                    )}
                    {b?.upcomingAdjustment && (
                      <p>A price change is scheduled for {new Date(b.upcomingAdjustment.effective_date + 'T12:00:00').toLocaleDateString()}.</p>
                    )}
                    {b && <p>{b.excludedOutliers} unusual or $0 prices and {b.excludedDiscounted} discounted events left out.</p>}
                  </CollapsibleContent>
                </Collapsible>

                <PricingSettings onChanged={() => { status.refetch(); if (ai.data) ai.refetch(); }} />
              </>
            )}
          </div>

          <div className="border-t border-border/60 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button className="w-full min-h-[48px]" disabled={!data?.suggestion_id || applying || ai.isFetching || disabled || !['open', 'unlocked'].includes(lock ?? '') || !tier?.items.length} onClick={() => setConfirmTier(picked)}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply {TIER_ORDER.find((t) => t.key === picked)?.label}{tier ? ` (${money(tier.subtotal)})` : ""}
            </Button>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">Tax stays exactly as you set it.</p>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmTier} onOpenChange={(o) => !o && setConfirmTier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update the estimate prices?</AlertDialogTitle>
            <AlertDialogDescription>
              Line item prices will change to the {confirmTier} tier ({confirmTier && data ? money(data.tiers[confirmTier].subtotal) : ''} before tax). You can undo right after.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction className="min-h-[44px]" onClick={() => confirmTier && apply(confirmTier)}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmUnlock} onOpenChange={setConfirmUnlock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Unlock className="h-4 w-4" /> Unlock pricing for revision?</AlertDialogTitle>
            <AlertDialogDescription>The customer already has this quote. After changing prices, resend the estimate so they see the update.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction className="min-h-[44px]" onClick={unlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function useUnlockPricing() {
  const qc = useQueryClient();
  return async (invoiceId: string) => {
    await callPricing({ action: 'unlock', invoice_id: invoiceId });
    qc.invalidateQueries({ queryKey: ['pricing-assistant', invoiceId] });
  };
}
