import { Button } from "@/components/ui/button";
import { MessageSquareText, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useHeroVisibility } from "@/contexts/HeroVisibilityContext";

type MobileActionBarProps = {
  className?: string;
};

/**
 * Mobile-only, site-wide sticky CTA bar.
 * Primary: Request Quote
 * Secondary: Text / Message
 * 
 * Hides when hero section is visible on the home page to avoid
 * obstructing the hero CTAs.
 */
export function MobileActionBar({ className }: MobileActionBarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { isHeroVisible } = useHeroVisibility();

  const isAdmin = pathname.startsWith("/admin");
  const isMobileQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(pathname);
  const isHomePage = pathname === "/" || pathname === "";
  
  // Customer portal routes where action bar should be hidden
  const isCustomerPortal = 
    pathname === "/estimate" ||
    pathname === "/customer-portal" ||
    pathname.startsWith("/customer/") ||
    pathname.startsWith("/estimate-preview/") ||
    pathname.startsWith("/invoice/public/");
  
  // Hide on admin, quote wizard, customer portal, or when hero is visible on home page
  const hidden = isAdmin || isMobileQuoteWizard || isCustomerPortal || (isHomePage && isHeroVisible);

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
          // Visibility and animation
          "transition-all duration-300 ease-out",
          hidden 
            ? "translate-y-full opacity-0 pointer-events-none" 
            : "translate-y-0 opacity-100",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
      role="region"
      aria-label="Quick actions"
      aria-hidden={hidden}
    >
      <div className="mx-auto flex max-w-xl gap-2">
        <Button
          asChild
          variant="cta"
          size="responsive-compact"
          className="flex-1"
          tabIndex={hidden ? -1 : 0}
        >
          <Link to="/request-quote" aria-label="Request a quote">
            <Sparkles className="h-4 w-4" />
            Quote
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="responsive-compact"
          className="flex-1"
          tabIndex={hidden ? -1 : 0}
        >
          <a
            href="sms:8439700265"
            aria-label="Text Soul Train's Eatery"
          >
            <MessageSquareText className="h-4 w-4" />
            Text
          </a>
        </Button>
      </div>
    </div>
  );
}
