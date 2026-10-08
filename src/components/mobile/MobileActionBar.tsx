import { Button } from "@/components/ui/button";
import { MessageSquareText, Phone, Sparkles } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useEffect, useState } from "react";
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
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/staff");
  const [pastTop, setPastTop] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      // Home: show only after the second section. Other pages: after hero/header + intro.
      const trigger = document.getElementById("mobile-cta-trigger");
      if (trigger) {
        setPastTop(trigger.getBoundingClientRect().top <= window.innerHeight);
      } else {
        setPastTop(window.scrollY > window.innerHeight * 1.2);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  const isMobileQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(pathname);
  
  // Customer portal routes where action bar should be hidden
  const isCustomerPortal = 
    pathname === "/estimate" ||
    pathname === "/customer-portal" ||
    pathname.startsWith("/customer/") ||
    pathname.startsWith("/estimate-preview/") ||
    pathname.startsWith("/invoice/public/");
  
  const hidden = isAdmin || isMobileQuoteWizard || isCustomerPortal || !pastTop;

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
        <Button asChild variant="cta" size="responsive-compact" className="flex-1" tabIndex={hidden ? -1 : 0}>
          <Link to="/request-quote" aria-label="Request a quote">
            <Sparkles className="h-4 w-4" />
            Get a Quote
          </Link>
        </Button>

        <Drawer open={contactOpen} onOpenChange={setContactOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="responsive-compact" className="flex-1" tabIndex={hidden ? -1 : 0} aria-label="Call or text Soul Train's Eatery">
              <Phone className="h-4 w-4" />
              Call / Text
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <DrawerTitle>Contact Soul Train's Eatery</DrawerTitle>
              <DrawerDescription>(843) 970-0265 · We'd love to help plan your event</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-3 px-4">
              <Button asChild variant="cta" className="h-14 justify-start gap-3 text-base">
                <a href="tel:8439700265" onClick={() => setContactOpen(false)}>
                  <Phone className="h-5 w-5" /> Call Us
                </a>
              </Button>
              <Button asChild variant="outline" className="h-14 justify-start gap-3 text-base">
                <a href="sms:8439700265" onClick={() => setContactOpen(false)}>
                  <MessageSquareText className="h-5 w-5" /> Send a Text
                </a>
              </Button>
            </div>
            <DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <DrawerClose asChild>
                <Button variant="ghost" className="h-12">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
