import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard, FileText, DollarSign, BarChart3,
  CalendarDays, Smartphone, Users, Menu, ArrowLeft, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const screens = [
  {
    title: "Events Dashboard",
    device: "Desktop",
    icon: LayoutDashboard,
    description:
      "A status-driven sales pipeline consolidating new submissions, active events, and completed bookings into a single scrollable view with inline filters and date navigation.",
    image: "/portfolio/events-dashboard.png",
    accent: "from-primary/20 to-primary/5",
  },
  {
    title: "Event Detail / Estimate Builder",
    device: "Desktop",
    icon: FileText,
    description:
      "A full-viewport event workspace with collapsible panels for customer details, menu editing, payment schedules, staff assignments, and a real-time shopping list — eliminating context-switching.",
    image: "/portfolio/event-detail.png",
    accent: "from-accent/20 to-accent/5",
  },
  {
    title: "Billing View",
    device: "Desktop",
    icon: DollarSign,
    description:
      "Centralized financial tracking with filterable payment status, invoice generation, and Stripe integration for seamless client payments.",
    image: "/portfolio/billing.png",
    accent: "from-secondary/30 to-secondary/5",
  },
  {
    title: "Reports & Analytics",
    device: "Desktop",
    icon: BarChart3,
    description:
      "Interactive revenue charts, item popularity analysis, and payment breakdowns giving owners instant business intelligence without spreadsheets.",
    image: "/portfolio/reports.png",
    accent: "from-primary/15 to-muted/20",
  },
  {
    title: "Staff Schedule — Desktop",
    device: "Desktop",
    icon: CalendarDays,
    description:
      "A resizable split-panel layout letting managers scan upcoming assignments on the left while reviewing full event details on the right.",
    image: "/portfolio/staff-desktop.png",
    accent: "from-accent/15 to-accent/5",
  },
  {
    title: "Staff Schedule — Mobile",
    device: "Mobile",
    icon: Smartphone,
    description:
      "Mobile-first card-based event list with tap-to-expand details, optimized for field staff checking assignments on the go.",
    image: "/portfolio/staff-mobile.png",
    accent: "from-primary/10 to-primary/5",
  },
  {
    title: "Customer Estimate Portal",
    device: "Public",
    icon: Users,
    description:
      "A branded, public-facing estimate view where clients review line items, approve proposals, and submit payments — no login required.",
    image: "/portfolio/customer-portal.png",
    accent: "from-secondary/20 to-secondary/5",
  },
  {
    title: "Mobile Admin Navigation",
    device: "Mobile",
    icon: Menu,
    description:
      "A fixed bottom tab bar with role-based visibility — admins see 5 tabs (Events, Billing, Reports, Staff, Settings) while staff see only their schedule.",
    image: "/portfolio/mobile-nav.png",
    accent: "from-muted/30 to-muted/10",
  },
];

const techStack = [
  "React 18", "TypeScript", "Tailwind CSS", "Supabase",
  "Stripe", "Vite", "React Query", "Framer Motion",
];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
          <span className="text-sm font-medium text-muted-foreground">UX Portfolio</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
        <Badge variant="secondary" className="mb-4">Case Study</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 font-playfair">
          Soul Train's Eatery
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          End-to-end catering operations platform — from quote request to payment collection, built for a family-run Charleston catering business.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Case Study Narrative */}
      <section className="mx-auto max-w-3xl px-4 pb-16 space-y-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Problem</h2>
          <p className="text-muted-foreground leading-relaxed">
            The owners managed catering operations through spreadsheets, email threads, and paper lists — resulting in missed follow-ups, inconsistent pricing, and no visibility into business performance. Staff had no centralized way to check assignments.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Approach</h2>
          <p className="text-muted-foreground leading-relaxed">
            Designed a role-based platform with three distinct experiences: an admin dashboard for full business management, a staff-only schedule view for field workers, and a branded customer portal for estimate approvals and payments. Every view is mobile-first with progressive enhancement for desktop.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Outcome</h2>
          <p className="text-muted-foreground leading-relaxed">
            Consolidated 10+ disconnected tools into a single platform. Quote-to-invoice time dropped from days to minutes. Staff check assignments on their phones. Customers approve estimates and pay deposits online — eliminating back-and-forth emails.
          </p>
        </div>
      </section>

      {/* Screenshot Gallery */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-12 font-playfair">Key Screens</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {screens.map((screen, i) => {
            const Icon = screen.icon;
            return (
              <Card key={i} className="overflow-hidden border-border/40 bg-card/50">
                {/* Image placeholder */}
                <div className={`relative aspect-video bg-gradient-to-br ${screen.accent} flex items-center justify-center border-b border-border/20`}>
                  <div className="text-center space-y-3">
                    <Icon className="h-12 w-12 mx-auto text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground/50 px-4">
                      Screenshot placeholder — capture from live app
                    </p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-base">{screen.title}</h3>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {screen.device}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {screen.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Built with Lovable · Design & Development by{" "}
          <span className="text-foreground font-medium">Soul Train's Eatery Team</span>
        </p>
      </footer>
    </div>
  );
}
