import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Printer } from "lucide-react";

const SECTIONS: { id: string; title: string; items: { h: string; body: string[] }[] }[] = [
  {
    id: "access",
    title: "1. Access & Roles",
    items: [
      { h: "Admin portal", body: ["Sign in at soultrainseatery.com/admin.", "Admins control events, pricing, menus, invoices, payments and customer notes."] },
      { h: "Staff portal", body: ["Staff sign in at soultrainseatery.com/staff.", "Staff see event details only (headcount, times, venue, dietary needs, menu). Prices and payments are always hidden."] },
    ],
  },
  {
    id: "daily",
    title: "2. Daily Workflow",
    items: [
      { h: "Upcoming & Balances Due", body: ["Events are listed by event date, soonest first.", "Fully paid past events are tucked under \"Show past events\"."] },
      { h: "Past-Due Balances (red card)", body: ["Only approved events that still owe money after a due date or the event date.", "Use Pay to record money received, or Remind to send a reminder you can preview first."] },
      { h: "New Submissions", body: ["New website requests appear here. Quotes are valid for 7 days.", "Unapproved quotes are never \"overdue\". If a quote goes nowhere, use Cancel Event (the customer is not emailed)."] },
      { h: "Calendars", body: ["Switch between List, Week and Month. Red marks show days with overdue balances."] },
    ],
  },
  {
    id: "events",
    title: "3. Creating & Managing Events",
    items: [
      { h: "Phone or repeat customers", body: ["Tap \"+ New Event\". Search by name, phone or email to auto-fill a past customer.", "Enter date, start time, guests and location, then finish the menu and pricing on the event page."] },
      { h: "Headcount", body: ["Catering package quantity + vegetarian/dietary plates = total guests. Use the sync option so the invoice and kitchen sheet match."] },
      { h: "Government Contract & Net 30", body: ["Standard events get 9% sales tax.", "Government Contract (tax exempt) is only applied when an admin turns it on. Military events are not exempt automatically.", "Net 30 is a separate switch, off by default. Only use it with a signed agency agreement."] },
    ],
  },
  {
    id: "payments",
    title: "4. Payments & Billing",
    items: [
      { h: "Standard schedule (10 / 40 / 50)", body: ["10% deposit on approval to hold the date.", "40% due 30 days before the event. 50% due 14 days before.", "Booked within 14 days of the event? 100% is due up front."] },
      { h: "Taking a payment by phone", body: ["Tap the green Pay button on any event.", "Card or ACH: enter details in the secure Stripe form. Card numbers go straight to Stripe and are never stored by us. ACH needs the customer's written consent.", "Opening the payment window changes nothing. Only a completed payment updates the event."] },
      { h: "Recording cash, check or WaveApp", body: ["Choose Record Payment, enter the amount and pick the method (Cash, Check, WaveApp, Bank Transfer, etc.).", "Untick \"Send confirmation email\" for payments already receipted elsewhere."] },
      { h: "Changing a due date", body: ["Tap \"Change date\" next to a payment in the schedule, or set a new date while logging a call.", "The event leaves Overdue and shows \"Payment Arranged\" until the new date. The customer's page updates too."] },
      { h: "Document names", body: ["Before approval: Catering Quote. Approved with a balance: Catering Invoice. Fully paid: Invoice & Receipt."] },
    ],
  },
  {
    id: "contact",
    title: "5. Customer Contact",
    items: [
      { h: "Log Call / Note", body: ["Record every call, text or visit on the event with a short note.", "This keeps a history for the team and pauses follow-ups for 7 days."] },
      { h: "Reminders", body: ["Automatic reminders are currently turned off. Send reminders with the amber Remind button and preview before sending.", "Thank-you emails are always sent manually."] },
      { h: "Customer payment link", body: ["Use the copy-link button on the event to text or email the customer their secure page."] },
    ],
  },
  {
    id: "help",
    title: "6. Getting Help",
    items: [
      { h: "Assistant", body: ["Tap the chef-hat Assistant button at the top of any admin page and ask in plain English.", "If it can't help, tap \"Send to Developer\" to email the conversation to envision@mkqconsulting.com."] },
    ],
  },
];

export default function AdminGuide() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10 print:max-w-none">
        <div className="mb-4 flex items-center justify-between gap-2 print:hidden">
          <Button asChild variant="ghost" size="sm" className="min-h-[40px]">
            <Link to="/admin"><ArrowLeft className="mr-1 h-4 w-4" />Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px]" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />Print
          </Button>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard Guide</h1>
        <p className="mt-2 text-muted-foreground">How to run bookings, payments and customer contact day to day.</p>

        <nav aria-label="Guide sections" className="mt-5 flex flex-wrap gap-2 print:hidden">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
              {s.title.replace(/^\d+\.\s/, "")}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 rounded-lg border bg-card p-4 sm:p-5">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <Accordion type="multiple" defaultValue={s.items.map((i) => i.h)} className="mt-2">
                {s.items.map((i) => (
                  <AccordionItem key={i.h} value={i.h}>
                    <AccordionTrigger className="text-left">{i.h}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                        {i.body.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
