export interface HelpTip {
  icon?: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const viewHelpTips: Record<string, HelpTip[]> = {
  events: [
    { text: "New quote requests appear in the Submissions card at the top — click to review and create an estimate." },
    { text: "The Event List below shows all active events. Click any row to open its detail page." },
    { text: "Use the calendar views (List, Week, Month) to manage your upcoming schedule." },
    { text: "Icon guide: 📞 Call customer · 💲 Send payment reminder · 📄 View event/estimate · ✉️ Email sent · 📬 Email opened · 🌐 Customer viewed portal." },
  ],
  billing: [
    { text: "Filter by status to quickly find overdue or pending invoices." },
    { text: "Click any invoice to view payment details, record payments, or resend payment links." },
    { text: "Payment milestones (deposit, balance) are tracked automatically from the estimate." },
  ],
  reports: [
    { text: "Use the date filter to compare revenue across different time periods." },
    { text: "Switch between Revenue, Events, Items, and Payments tabs for different insights." },
    { text: "All report data updates in real-time as events and payments are processed." },
  ],
  settings: [
    { text: "Configure quiet hours under Notifications to pause alerts during off-hours." },
    { text: "Check the Email Delivery tab to troubleshoot missing customer emails." },
    { text: "Preview how your emails look to customers in the Email Templates tab." },
  ],
};

export const eventLifecycle = [
  { status: 'pending', label: 'Request Received' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'estimated', label: 'Estimate Created' },
  { status: 'sent', label: 'Estimate Sent' },
  { status: 'viewed', label: 'Customer Viewed' },
  { status: 'approved', label: 'Approved' },
  { status: 'partially_paid', label: 'Partially Paid' },
  { status: 'paid', label: 'Paid' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'completed', label: 'Completed' },
];

export const gettingStartedSteps = [
  "Check the Events view daily for new quote submissions.",
  "Click a submission to open the event detail page and review the request.",
  "Create an estimate from the Estimate panel — line items are auto-generated from the quote.",
  "Send the estimate to the customer via email with one click.",
  "Track payment status in the Billing view as customers pay through Stripe.",
];

export const workflowGuides = [
  {
    title: "Creating & Sending an Estimate",
    steps: [
      "Open the event detail page from the Events view.",
      "Go to the Estimate panel — system auto-generates line items.",
      "Review pricing, adjust tax (0% for government), add custom items.",
      "Set payment schedule (50/50 deposit, Net 30, or custom).",
      "Click Save, then Send to Customer.",
    ],
  },
  {
    title: "Processing a Change Request",
    steps: [
      "Navigate to the event's detail page.",
      "Open the Change Requests section.",
      "Review the customer's requested changes and cost impact.",
      "Approve (auto-creates new estimate version) or Reject with explanation.",
    ],
  },
  {
    title: "Tracking Payments",
    steps: [
      "Go to the Billing view to see all invoices.",
      "Filter by status: Pending, Partially Paid, Paid, or Overdue.",
      "Click an invoice to see transaction history and milestone completion.",
      "Resend payment links from the invoice detail if needed.",
    ],
  },
];

export const troubleshootingFAQ: FAQItem[] = [
  {
    question: "Customer didn't receive the estimate email?",
    answer: "Check the customer's email address is correct, ask them to check spam, then try resending from the event detail page. Go to Settings → Email Delivery to check delivery logs.",
  },
  {
    question: "Payment button not working for a customer?",
    answer: "Verify Stripe API keys are configured in Supabase secrets. Check the Stripe Dashboard for webhook status and review edge function logs.",
  },
  {
    question: "Event status isn't updating?",
    answer: "Check edge function logs in the Supabase dashboard. Verify database triggers are active. Refresh the page and try again.",
  },
  {
    question: "How do I handle a government contract?",
    answer: "Government contracts use Net 30 payment terms (no upfront deposit), 0% tax, and require a PO number. Set these in the estimate payment schedule.",
  },
  {
    question: "Can I edit an estimate after sending it?",
    answer: "Yes — open the event detail page, make changes in the Estimate panel, save, and resend. The customer will receive an updated link.",
  },
];
