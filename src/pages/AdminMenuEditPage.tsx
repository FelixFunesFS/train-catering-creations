import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuEditorInline } from "@/components/admin/events/MenuEditorInline";
import { useQuote } from "@/hooks/useQuotes";
import { useInvoiceByQuote } from "@/hooks/useInvoices";

export default function AdminMenuEditPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quote, isLoading: quoteLoading } = useQuote(quoteId);
  const { data: invoice, isLoading: invoiceLoading } = useInvoiceByQuote(quoteId);

  const isLoading = quoteLoading || invoiceLoading;

  const title = useMemo(() => {
    if (!quote?.event_name) return "Edit Menu Selections";
    return `Edit Menu • ${quote.event_name}`;
  }, [quote?.event_name]);

  const handleBack = () => {
    if (quoteId) navigate(`/admin/event/${quoteId}`);
    else navigate("/admin?view=events");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading menu editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-semibold truncate" title={title}>
            Edit Menu Selections
          </h1>
        </div>
      </header>

      {/* Explicit height to guarantee ScrollArea can calculate properly */}
      <div className="flex-1 h-[calc(100vh-3.5rem)] min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {quote ? (
              <MenuEditorInline
                quote={quote}
                invoiceId={invoice?.id}
                onSave={() => {
                  queryClient.invalidateQueries({ queryKey: ["quotes"] });
                  if (invoice?.id) {
                    queryClient.invalidateQueries({ queryKey: ["line-items", invoice.id] });
                    queryClient.invalidateQueries({ queryKey: ["invoice", invoice.id] });
                  }
                  handleBack();
                }}
              />
            ) : (
              <div className="text-sm text-muted-foreground">Event not found.</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
