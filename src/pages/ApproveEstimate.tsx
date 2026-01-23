import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, FileText } from "lucide-react";

type ApproveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; portalUrl: string }
  | { status: "error"; message: string };

export default function ApproveEstimate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<ApproveState>({ status: "idle" });

  const portalUrl = useMemo(() => {
    if (!token) return "";
    return `/estimate?token=${encodeURIComponent(token)}#payment`;
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        setState({ status: "error", message: "Missing or invalid approval link." });
        return;
      }

      setState({ status: "loading" });
      const { data, error } = await supabase.functions.invoke("approve-estimate", {
        body: { token },
      });

      if (cancelled) return;

      if (error) {
        setState({ status: "error", message: error.message || "Unable to approve." });
        return;
      }

      setState({ status: "success", portalUrl: data?.portalUrl || portalUrl });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, portalUrl]);

  // After successful approval, automatically take the customer to payment.
  useEffect(() => {
    if (state.status !== "success") return;

    const t = setTimeout(() => {
      // Use replace to avoid leaving an extra history entry (prevents back/forward confusion on mobile)
      navigate(state.portalUrl, { replace: true });
    }, 600);

    return () => clearTimeout(t);
  }, [state, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Approve your catering estimate</CardTitle>
          <p className="text-sm text-muted-foreground">
            This confirms your estimate and unlocks your payment options.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.status === "loading" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Approving…</p>
                <p className="text-sm text-muted-foreground">One moment while we get everything ready.</p>
              </div>
            </div>
          )}

          {state.status === "success" && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Approved!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to payment to secure your date…
                </p>
              </div>
            </div>
          )}

          {state.status === "error" && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/40 bg-destructive/5">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Approval failed</p>
                <p className="text-sm text-muted-foreground">{state.message}</p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" disabled={state.status !== "success"}>
              <Link to={state.status === "success" ? state.portalUrl : "#"}>
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" disabled={state.status !== "success"}>
              <Link to={state.status === "success" ? state.portalUrl.replace("#payment", "") : "#"}>
                <FileText className="mr-2 h-4 w-4" />
                View Full Details
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Questions? Call (843) 970-0265 or email soultrainseatery@gmail.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
