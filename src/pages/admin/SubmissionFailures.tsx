import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Eye,
  ExternalLink,
} from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/admin/PaginationControls";

type FailureRow = {
  id: string;
  created_at: string;
  failure_stage: string;
  form_type: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  error_message: string | null;
  partial_payload: Record<string, unknown> | null;
  url: string | null;
  resolved: boolean;
  resolved_at: string | null;
  converted_to_quote_id: string | null;
  admin_notes: string | null;
};

export default function SubmissionFailures() {
  const [rows, setRows] = useState<FailureRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("submission_failures")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data as FailureRow[]) || []);
    } catch (e) {
      console.error("[SubmissionFailures] load error", e);
      toast.error("Failed to load submission failures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showResolved && r.resolved) return false;
      if (!q) return true;
      return (
        (r.email || "").toLowerCase().includes(q) ||
        (r.contact_name || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.error_message || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, showResolved]);

  const stats = useMemo(() => {
    const total = rows.length;
    const unresolved = rows.filter((r) => !r.resolved).length;
    const recovered = rows.filter((r) => r.converted_to_quote_id).length;
    return { total, unresolved, recovered };
  }, [rows]);

  const { currentPage, setCurrentPage, totalPages, startIndex, endIndex } = usePagination(
    filtered.length,
    25,
    [search, showResolved]
  );
  const paginated = useMemo(() => filtered.slice(startIndex, endIndex), [filtered, startIndex, endIndex]);

  const markResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from("submission_failures")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Marked resolved");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-elegant font-semibold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-warning" />
              Lost Leads — Submission Failures
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quote requests that hit an error before reaching the database. Review and recover manually.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Total</div>
              <div className="text-2xl font-semibold mt-1">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Unresolved</div>
              <div className="text-2xl font-semibold mt-1 text-warning">{stats.unresolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Recovered</div>
              <div className="text-2xl font-semibold mt-1 text-success">{stats.recovered}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base">Failures</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={showResolved ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowResolved((v) => !v)}
                >
                  {showResolved ? "Hiding nothing" : "Hide resolved"}
                </Button>
                <Input
                  className="w-full sm:w-[260px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name / email / phone / error…"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {paginated.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {isLoading ? "Loading…" : "No failures match your filters."}
                  </div>
                ) : (
                  paginated.map((r) => (
                    <div key={r.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={r.resolved ? "secondary" : "destructive"}>
                              {r.resolved ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolved
                                </>
                              ) : (
                                "Unresolved"
                              )}
                            </Badge>
                            <Badge variant="outline">{r.failure_stage}</Badge>
                            {r.form_type ? <Badge variant="outline">{r.form_type}</Badge> : null}
                            {r.converted_to_quote_id ? (
                              <Badge variant="secondary">Converted → quote</Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 text-sm font-medium">
                            {r.contact_name || "(no name)"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
                            {r.email ? (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {r.email}
                              </span>
                            ) : null}
                            {r.phone ? (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {r.phone}
                              </span>
                            ) : null}
                          </div>
                          {r.error_message ? (
                            <div className="mt-2 text-xs text-destructive break-words">
                              {r.error_message}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View payload
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Partial payload</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-auto">
                                {JSON.stringify(r.partial_payload || {}, null, 2)}
                              </pre>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {r.email ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`mailto:${r.email}?subject=Following%20up%20on%20your%20catering%20request`}>
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              Email
                            </a>
                          </Button>
                        ) : null}
                        {r.phone ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${r.phone}`}>
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              Call
                            </a>
                          </Button>
                        ) : null}
                        {r.url ? (
                          <Button asChild variant="ghost" size="sm">
                            <a href={r.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Form URL
                            </a>
                          </Button>
                        ) : null}
                        {!r.resolved ? (
                          <Button variant="secondary" size="sm" onClick={() => markResolved(r.id)}>
                            Mark resolved
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminLayout>
  );
}
