import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Trash2 } from 'lucide-react';

const db = supabase as any;
const dollars = (c: number) => (c / 100).toFixed(2);

export function PricingSettings({ onChanged }: { onChanged: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const floors = useQuery({
    queryKey: ['pricing-floors'],
    queryFn: async () => (await db.from('business_config').select('config_value').eq('config_key', 'pricing_floors').maybeSingle()).data?.config_value ?? { per_head_cents: 0, minimum_order_cents: 0 },
  });
  const adjustments = useQuery({
    queryKey: ['pricing-adjustments'],
    queryFn: async () => (await db.from('pricing_adjustments').select('*').order('effective_date', { ascending: false })).data ?? [],
  });

  const [perHead, setPerHead] = useState('');
  const [minimum, setMinimum] = useState('');
  const [adj, setAdj] = useState({ effective_date: '', scope: 'all', scope_value: '', adjustment_type: 'flat', amount: '' });

  const saveFloors = async () => {
    const value = {
      per_head_cents: Math.round(parseFloat(perHead || dollars(floors.data?.per_head_cents ?? 0)) * 100),
      minimum_order_cents: Math.round(parseFloat(minimum || dollars(floors.data?.minimum_order_cents ?? 0)) * 100),
    };
    const { error } = await db.from('business_config').update({ config_value: value, updated_at: new Date().toISOString() }).eq('config_key', 'pricing_floors');
    if (error) return toast({ title: 'Could not save', variant: 'destructive' });
    qc.invalidateQueries({ queryKey: ['pricing-floors'] }); onChanged(); toast({ title: 'Minimums saved' });
  };

  const addAdjustment = async () => {
    const amt = parseFloat(adj.amount);
    if (!adj.effective_date || !Number.isFinite(amt)) return toast({ title: 'Enter a date and amount', variant: 'destructive' });
    const { error } = await db.from('pricing_adjustments').insert({
      effective_date: adj.effective_date, scope: adj.scope, scope_value: adj.scope === 'all' ? null : adj.scope_value.trim() || null,
      adjustment_type: adj.adjustment_type, amount: adj.adjustment_type === 'flat' ? Math.round(amt * 100) : amt,
    });
    if (error) return toast({ title: 'Could not add', variant: 'destructive' });
    setAdj({ effective_date: '', scope: 'all', scope_value: '', adjustment_type: 'flat', amount: '' });
    qc.invalidateQueries({ queryKey: ['pricing-adjustments'] }); onChanged();
  };

  const remove = async (id: string) => {
    await db.from('pricing_adjustments').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['pricing-adjustments'] }); onChanged();
  };

  const select = 'h-11 rounded-md border border-input bg-background px-2 text-sm';

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
        Price changes & minimums <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pb-2">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggestions never go below these.</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Per guest ($)
              <Input inputMode="decimal" className="mt-1 h-11" placeholder={dollars(floors.data?.per_head_cents ?? 0)} value={perHead} onChange={(e) => setPerHead(e.target.value)} />
            </label>
            <label className="text-xs">Catering minimum ($)
              <Input inputMode="decimal" className="mt-1 h-11" placeholder={dollars(floors.data?.minimum_order_cents ?? 0)} value={minimum} onChange={(e) => setMinimum(e.target.value)} />
            </label>
          </div>
          <Button variant="outline" size="sm" className="min-h-[44px] w-full" onClick={saveFloors}>Save minimums</Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Price change: older events are brought up to today's prices. Future dates kick in automatically.</p>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" className="h-11" value={adj.effective_date} onChange={(e) => setAdj({ ...adj, effective_date: e.target.value })} aria-label="Starts on" />
            <select className={select} value={adj.scope} onChange={(e) => setAdj({ ...adj, scope: e.target.value })} aria-label="Applies to">
              <option value="all">Everything</option><option value="category">A category</option><option value="item">One item</option>
            </select>
            {adj.scope !== 'all' && (
              <Input className="col-span-2 h-11" placeholder={adj.scope === 'category' ? 'e.g. sides' : 'e.g. Catering Package'} value={adj.scope_value} onChange={(e) => setAdj({ ...adj, scope_value: e.target.value })} />
            )}
            <select className={select} value={adj.adjustment_type} onChange={(e) => setAdj({ ...adj, adjustment_type: e.target.value })} aria-label="Type">
              <option value="flat">+ $ per unit</option><option value="percent">+ %</option>
            </select>
            <Input inputMode="decimal" className="h-11" placeholder={adj.adjustment_type === 'flat' ? '1.00' : '5'} value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} aria-label="Amount" />
          </div>
          <Button variant="outline" size="sm" className="min-h-[44px] w-full" onClick={addAdjustment}>Add price change</Button>
          <ul className="divide-y divide-border/60">
            {(adjustments.data ?? []).map((a: any) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {new Date(a.effective_date + 'T12:00:00').toLocaleDateString()} · {a.adjustment_type === 'flat' ? `+$${dollars(a.amount)}` : `+${a.amount}%`}
                  <span className="text-muted-foreground"> · {a.scope === 'all' ? 'everything' : a.scope_value}</span>
                </span>
                <Button variant="ghost" size="icon" className="h-11 w-11 !shadow-none" aria-label="Remove price change" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
