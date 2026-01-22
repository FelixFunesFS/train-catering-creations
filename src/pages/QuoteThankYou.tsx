import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SuccessStep } from "@/components/quote/alternative-form/SuccessStep";

type ThankYouEventData = {
  eventName: string;
  eventDate: string;
  startTime?: string;
  location?: string;
  contactName?: string;
};

export default function QuoteThankYou() {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const eventData = useMemo<ThankYouEventData | undefined>(() => {
    try {
      const raw = sessionStorage.getItem("quote_thankyou_eventData");
      if (!raw) return undefined;
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-10 px-4">
      <SuccessStep estimatedCost={null} quoteId={quoteId} eventData={eventData} />
    </div>
  );
}
