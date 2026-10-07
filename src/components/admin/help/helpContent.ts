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
    { text: "New quote requests appear in New Submissions at the top (collapsed on phones — tap to open). Open one to review and build the quote." },
    { text: "The list is sorted by event date (soonest first). Use Sort — or the Filters button on phones — to sort by submission date." },
    { text: "Past-Due Balances (red card) only shows approved events that still owe money after a due date or the event date. Unapproved quotes never show as overdue." },
    { text: "Fully paid past events are tucked away under “Show past events”. Use List, Week or Month to see your schedule." },
    { text: "Buttons: green Pay = take or record a payment · amber Remind = preview and send a payment reminder · Call = phone the customer · View = open the event." },
    { text: "Phone customer or repeat client? Tap “+ New Event” and search their name, phone or email to autofill." },
    { text: "Stuck? Tap Assistant at the top to ask a question or send a request to the developer." },
  ],
  billing: [
    { text: "Filter by status to find payment-due, partially paid or overdue invoices. Quotes that are not yet approved are not listed as owing money." },
    { text: "Open an invoice to see payment history, record payments, copy the customer portal link, or resend reminders." },
    { text: "Payments follow 10% deposit, 40% at 30 days before, 50% at 14 days before. Booked 14 days or less out = 100% due now." },
    { text: "The last successful payment date and time appears on each invoice. Declined or pending card attempts are not counted." },
  ],
  reports: [
    { text: "Use the date filter to compare revenue across different time periods." },
    { text: "Switch between Revenue, Events, Items, and Payments tabs for different insights." },
    { text: "Report numbers update as events and payments are recorded." },
  ],
  settings: [
    { text: "Configure quiet hours under Notifications to pause alerts during off-hours." },
    { text: "Check the Email Delivery tab to troubleshoot missing customer emails." },
    { text: "Preview how your emails look to customers in the Email Templates tab." },
    { text: "Automatic payment and event reminder emails are currently turned off — reminders are only sent when you tap Remind." },
  ],
};

export const eventLifecycle = [
  { status: 'pending', label: 'Request Received (New Submission)' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'estimated', label: 'Quote Created' },
  { status: 'sent', label: 'Quote Sent (valid 7 days)' },
  { status: 'viewed', label: 'Customer Viewed Quote' },
  { status: 'approved', label: 'Approved — becomes an Invoice' },
  { status: 'partially_paid', label: 'Partially Paid' },
  { status: 'paid', label: 'Paid in Full — Receipt' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'completed', label: 'Completed (send thank-you manually)' },
];

export const gettingStartedSteps = [
  "Check New Submissions daily and open each new request.",
  "Review the menu and guest count, then build the quote — line items are created from the request automatically.",
  "Preview and send the quote. The customer sees a “Catering Quote” until they approve it.",
  "Once approved it becomes a “Catering Invoice” with the 10% / 40% / 50% payment schedule.",
  "Watch the Past-Due Balances card and send reminders with the amber Remind button (automatic reminders are off).",
  "Take phone payments with the green Pay button, and record cash, checks, ACH or WaveApp payments there too.",
  "After the event, mark it complete and send the thank-you email when you are ready.",
];

export const workflowGuides = [
  {
    title: "Creating & Sending a Quote",
    steps: [
      "Open the event from the Events list.",
      "Review menu items and guest count (catering package + vegetarian portions = total guests).",
      "Tax is the standard 9%. Only turn on Government Contract (tax exempt) if the customer is truly exempt — it is never automatic, not even for military events.",
      "Net 30 terms stay OFF unless you switch them on for this event.",
      "Save, then tap Preview & Send. The quote is valid for 7 days.",
    ],
  },
  {
    title: "Taking a Payment Over the Phone",
    steps: [
      "Tap the green Pay button on the event (or Take Payment on the event page).",
      "Card or bank (ACH): use the “Stripe (Card / ACH)” tab and type the details into the secure Stripe form. Card numbers are never stored in our system.",
      "Cash, check, bank transfer, WaveApp, etc.: use “Record Payment”, pick the method, enter the amount and a note (check number, reference).",
      "ACH Direct Debit requires written customer authorization — tick the authorization box.",
      "Untick “Send confirmation email” for old payments already receipted elsewhere (like WaveApp).",
      "Just opening the payment window changes nothing. Status only updates after a payment succeeds or you record one.",
    ],
  },
  {
    title: "Customer Needs a Different Due Date",
    steps: [
      "Open the event and find the payment schedule.",
      "Tap “Change date” next to the unpaid payment and choose the agreed date. Add a short note.",
      "The Overdue tag clears until the new date passes. The customer portal shows the new date.",
      "Tip: you can also set the next due date while logging the phone call.",
    ],
  },
  {
    title: "Logging a Call, Text or Note",
    steps: [
      "Open the event and tap “Log Call / Note”.",
      "Choose call, text, in person or note, and add what was discussed.",
      "This shows “Last contacted” on the event and pauses follow-ups for 7 days.",
    ],
  },
  {
    title: "Adding a Phone or Repeat Customer",
    steps: [
      "On Events, tap “+ New Event”.",
      "Search the customer's name, phone or email — tap a match to autofill their details.",
      "Fill in the event name, date, start time, guest count and location, then save.",
      "Finish the menu and pricing on the event page, then send the quote or approve it for them.",
    ],
  },
  {
    title: "Cancelling or Cleaning Up Old Quotes",
    steps: [
      "Quotes never approved are not money owed — they are lost leads.",
      "Open the event (or use Cancel on the submission) and confirm Cancel Event.",
      "No email is sent to the customer. The record stays under the Cancelled filter.",
    ],
  },
  {
    title: "Processing a Change Request",
    steps: [
      "Open the event's page and go to Change Requests.",
      "Review the requested changes and the cost difference.",
      "Approve (creates an updated quote) or reject with an explanation.",
    ],
  },
];

export const troubleshootingFAQ: FAQItem[] = [
  {
    question: "Customer didn't receive the email?",
    answer: "Check the email address, ask them to check spam, then resend from the event page. Settings → Email Delivery shows whether it was sent. You can also copy their portal link and text it to them.",
  },
  {
    question: "Why does an event show Overdue?",
    answer: "Only approved events with money still owed after a payment due date (or after the event) show Overdue. If you agreed on a new date, use “Change date” on that payment.",
  },
  {
    question: "Customer's card was declined?",
    answer: "The decline reason shows on the invoice. Ask the customer to call their bank or use another card, then try again — each retry is a fresh attempt.",
  },
  {
    question: "How do I handle a government or military event?",
    answer: "Standard 9% tax applies unless you manually turn on Government Contract (tax exempt). Net 30 is a separate switch and stays off unless you turn it on.",
  },
  {
    question: "Are reminder emails sent automatically?",
    answer: "Not right now — automatic reminders are turned off. Use the amber Remind button, preview the email, then send. Thank-you emails are always sent manually.",
  },
  {
    question: "Can I edit a quote after sending it?",
    answer: "Yes — make changes on the event page, save, and resend. The customer's link always shows the latest version.",
  },
  {
    question: "Something is broken or I need a new feature?",
    answer: "Tap Assistant at the top, then “Send to Developer”. Your note and the conversation are emailed to envision@mkqconsulting.com.",
  },
];
