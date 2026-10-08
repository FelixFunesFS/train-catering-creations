import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChefHat, Send, Mail, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUPABASE_URL = 'https://qptprrqjlcvfkhfdnnoa.supabase.co';
const FN_URL = `${SUPABASE_URL}/functions/v1/admin-assistant`;

const SUGGESTIONS = [
  'A customer wants to pay by phone with a card',
  'Customer needs until Friday to pay the deposit',
  'How do I record a WaveApp payment?',
  'How do I add a repeat customer?',
];

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token ?? ''}`,
  };
}

export function AdminAssistant() {
  // Persist across page re-renders/remounts (e.g. mobile keyboard resize) so the chat never resets
  const [open, setOpenState] = useState(() => sessionStorage.getItem('adminAssistant.open') === '1');
  const [messages, setMessages] = useState<Msg[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('adminAssistant.messages') || '[]'); } catch { return []; }
  });
  const setOpen = (v: boolean) => { setOpenState(v); sessionStorage.setItem('adminAssistant.open', v ? '1' : '0'); };
  useEffect(() => {
    sessionStorage.setItem('adminAssistant.messages', JSON.stringify(messages.slice(-30)));
  }, [messages]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [intent, setIntent] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, showEscalate]);

  const page = `${location.pathname}${location.search}`;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const history: Msg[] = [...messages, { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ messages: history, page }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        let msg = 'The assistant is unavailable right now.';
        try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: acc }]);
      }
      if (!acc) setMessages([...history, { role: 'assistant', content: "I couldn't come up with an answer. Tap **Send to Developer** for help." }]);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setMessages([...history, { role: 'assistant', content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const escalate = async () => {
    setEscalating(true);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ action: 'escalate', messages, intent, page }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? 'Could not send.');
      toast({ title: 'Sent to developer', description: 'Your request and conversation were emailed to envision@mkqconsulting.com.' });
      setShowEscalate(false);
      setIntent('');
      setMessages((m) => [...m, { role: 'assistant', content: '✅ Sent to the developer at envision@mkqconsulting.com. They will follow up by email.' }]);
    } catch (e) {
      toast({ title: 'Not sent', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setEscalating(false);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setShowEscalate(false);
    setIntent('');
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-2 h-10" aria-label="Open admin assistant">
        <ChefHat className="h-4 w-4" />
        <span className="hidden sm:inline">Assistant</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          onInteractOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="w-full sm:max-w-md p-0 flex flex-col gap-0 h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="px-4 py-3 border-b text-left space-y-0.5">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ChefHat className="h-4 w-4" />
              </span>
              Admin Assistant
            </SheetTitle>
            <SheetDescription className="text-xs">
              Ask how to do anything. Need a change? Send it to the developer.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm rounded-lg border px-3 py-2.5 min-h-[44px] hover:bg-muted/60 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="text-sm text-foreground leading-relaxed [&_p]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_h3]:font-semibold [&_h3]:mt-2">
                  {m.content ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                    </span>
                  )}
                </div>
              ),
            )}

            {showEscalate && (
              <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <label htmlFor="dev-intent" className="text-sm font-medium">What do you need the developer to do?</label>
                <Textarea
                  id="dev-intent"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="e.g. Add a field for the venue contact name"
                  rows={3}
                  className="text-base sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">This note and the conversation above go to envision@mkqconsulting.com.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10" onClick={() => setShowEscalate(false)}>Cancel</Button>
                  <Button className="flex-1 h-10" onClick={escalate} disabled={escalating || (!intent.trim() && messages.length === 0)}>
                    {escalating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send
                  </Button>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t p-3 space-y-2">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Ask a question or describe what you need…"
                rows={1}
                autoFocus={false}
                aria-label="Message the assistant"
                className="min-h-[44px] max-h-32 resize-none text-base sm:text-sm"
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={loading || !input.trim()} aria-label="Send">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => setShowEscalate(true)} disabled={showEscalate}>
                <Mail className="h-4 w-4" /> Send to Developer
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 h-9" onClick={reset} disabled={messages.length === 0}>
                <RotateCcw className="h-4 w-4" /> New chat
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
