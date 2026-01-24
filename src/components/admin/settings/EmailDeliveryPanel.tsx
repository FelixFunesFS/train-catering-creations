import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { RefreshCw, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";

type EmailEventType = "email_send_attempt" | "email_send_success" | "email_send_failure";

type AnalyticsEmailEvent = {
  id: string;
  created_at: string;
  event_type: EmailEventType;
  entity_type: string;
  metadata: Record<string, unknown> | null;
};

function getMetaString(meta: Record<string, unknown> | null | undefined, key: string): string {
  const v = meta?.[key];
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

export function EmailDeliveryPanel() {
  const [rows, setRows] = useState<AnalyticsEmailEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toFilter, setToFilter] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("id, created_at, event_type, entity_type, metadata")
        .eq("entity_type", "email")
        .in("event_type", ["email_send_attempt", "email_send_success", "email_send_failure"])
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setRows((data as AnalyticsEmailEvent[]) || []);
    } catch (e) {
      console.error("[EmailDeliveryPanel] Failed to load analytics_events", e);
      toast.error("Failed to load email delivery events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = toFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => getMetaString(r.metadata, "to").toLowerCase().includes(q));
  }, [rows, toFilter]);

  const stats = useMemo(() => {
    let attempts = 0;
    let successes = 0;
    let failures = 0;
    for (const r of filtered) {
      if (r.event_type === "email_send_attempt") attempts += 1;
      if (r.event_type === "email_send_success") successes += 1;
      if (r.event_type === "email_send_failure") failures += 1;
    }
    return { attempts, successes, failures };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Delivery
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This shows what the app attempted/succeeded at (SMTP accepted). If Exchange shows nothing,
                it’s being filtered/dropped downstream.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Attempts: {stats.attempts}</Badge>
              <Badge variant="secondary">Success: {stats.successes}</Badge>
              {stats.failures > 0 ? (
                <Badge variant="destructive">Failures: {stats.failures}</Badge>
              ) : (
                <Badge variant="outline" className="border-transparent" />
              )}
            </div>

            <div className="w-full sm:w-[360px]">
              <Input
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                placeholder="Filter by recipient email…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[520px]">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No email events found.</div>
              ) : (
                filtered.map((r) => {
                  const to = getMetaString(r.metadata, "to");
                  const subject = getMetaString(r.metadata, "subject");
                  const from = getMetaString(r.metadata, "resolvedFrom") || getMetaString(r.metadata, "from");
                  const emailType = getMetaString(r.metadata, "emailType");
                  const messageId = getMetaString(r.metadata, "messageId");
                  const errorMessage = getMetaString(r.metadata, "errorMessage");

                  const Icon =
                    r.event_type === "email_send_success"
                      ? CheckCircle2
                      : r.event_type === "email_send_failure"
                        ? AlertTriangle
                        : Mail;

                  const badgeVariant =
                    r.event_type === "email_send_success"
                      ? "secondary"
                      : r.event_type === "email_send_failure"
                        ? "destructive"
                        : "outline";

                  return (
                    <div key={r.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant={badgeVariant as any}>
                              {r.event_type.replace("email_", "").replace(/_/g, " ")}
                            </Badge>
                            {emailType ? <Badge variant="outline">{emailType}</Badge> : null}
                          </div>
                          <div className="mt-2 text-sm">
                            <div className="truncate">
                              <span className="text-muted-foreground">To:</span> {to || "—"}
                            </div>
                            <div className="truncate">
                              <span className="text-muted-foreground">Subject:</span> {subject || "—"}
                            </div>
                            <div className="truncate">
                              <span className="text-muted-foreground">From:</span> {from || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                      </div>

                      {(messageId || errorMessage) && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {messageId ? <div>Message ID: {messageId}</div> : null}
                          {errorMessage ? <div className="text-destructive">{errorMessage}</div> : null}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
