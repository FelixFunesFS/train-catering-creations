import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Rocket, ListChecks, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  gettingStartedSteps,
  workflowGuides,
  eventLifecycle,
  troubleshootingFAQ,
} from './helpContent';

interface AdminHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminHelpDialog({ open, onOpenChange }: AdminHelpDialogProps) {
  const [search, setSearch] = useState('');
  const lower = search.toLowerCase();

  const filteredFAQ = troubleshootingFAQ.filter(
    (f) => f.question.toLowerCase().includes(lower) || f.answer.toLowerCase().includes(lower)
  );

  const filteredWorkflows = workflowGuides.filter(
    (w) =>
      w.title.toLowerCase().includes(lower) ||
      w.steps.some((s) => s.toLowerCase().includes(lower))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📖 Admin Help Guide
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <Tabs defaultValue="start" className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full">
              <TabsTrigger value="start" className="gap-1.5 text-xs px-2.5">
                <Rocket className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Getting Started</span>
                <span className="sm:hidden">Start</span>
              </TabsTrigger>
              <TabsTrigger value="workflows" className="gap-1.5 text-xs px-2.5">
                <ListChecks className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Workflows</span>
                <span className="sm:hidden">How-to</span>
              </TabsTrigger>
              <TabsTrigger value="statuses" className="gap-1.5 text-xs px-2.5">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Statuses</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-1.5 text-xs px-2.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 pr-1">
            <TabsContent value="start" className="mt-0 space-y-3">
              <p className="text-sm text-muted-foreground">Your daily checklist to stay on top of everything:</p>
              <ol className="space-y-2 text-sm">
                {gettingStartedSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="workflows" className="mt-0 space-y-2">
              {filteredWorkflows.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No workflows match your search.</p>
              )}
              {filteredWorkflows.map((wf, i) => (
                <Collapsible key={i}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                    <ListChecks className="h-4 w-4 text-primary shrink-0" />
                    {wf.title}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ol className="ml-9 space-y-1.5 text-sm text-muted-foreground pb-2">
                      {wf.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-primary/50 font-mono text-xs mt-0.5">{j + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TabsContent>

            <TabsContent value="statuses" className="mt-0">
              <p className="text-sm text-muted-foreground mb-3">Event lifecycle from request to completion:</p>
              <div className="space-y-0">
                {eventLifecycle.map((item, i) => (
                  <div key={item.status} className="flex items-center gap-3 py-1.5">
                    <div className="flex flex-col items-center">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {i + 1}
                      </span>
                      {i < eventLifecycle.length - 1 && (
                        <div className="w-px h-4 bg-primary/20" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.status}</code>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-0 space-y-2">
              {filteredFAQ.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No FAQs match your search.</p>
              )}
              {filteredFAQ.map((faq, i) => (
                <Collapsible key={i}>
                  <CollapsibleTrigger className="flex items-start gap-2 w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {faq.question}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className="ml-9 text-sm text-muted-foreground pb-2 pr-2">{faq.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
