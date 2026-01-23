import { Button } from "@/components/ui/button";
import { MessageSquareText, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type MobileActionBarProps = {
  className?: string;
};

/**
 * Mobile-only, site-wide sticky CTA bar.
 * Primary: Request Quote
 * Secondary: Text / Message
 */
export function MobileActionBar({ className }: MobileActionBarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const isAdmin = pathname.startsWith("/admin");
  const isMobileQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(pathname);
  const hidden = isAdmin || isMobileQuoteWizard;

  if (hidden) return null;

  return (
    <div
      className={
        [
          "fixed inset-x-0 bottom-0 z-40",
          "border-t border-border",
          "bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          "shadow-lg",
          "px-3 sm:px-4",
          "pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-xl gap-2">
        <Button
          asChild
          variant="cta"
          size="responsive-xl"
          className="flex-1"
        >
          <Link to="/request-quote" aria-label="Request a quote">
            <Sparkles className="h-4 w-4" />
            Request Quote
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="responsive-xl"
          className="flex-1"
        >
          <a
            href="sms:8439700265"
            aria-label="Text Soul Train's Eatery"
          >
            <MessageSquareText className="h-4 w-4" />
            Text Us
          </a>
        </Button>
      </div>
    </div>
  );
}
