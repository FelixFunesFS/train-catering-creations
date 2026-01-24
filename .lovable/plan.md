
Context & what we already know (from logs)
- The system is successfully attempting and completing SMTP sends to `envision@mkqconsulting.com`.
  - Edge function logs show:
    - `Sending email via SMTP to: envision@mkqconsulting.com …`
    - `Email sent successfully via SMTP to: envision@mkqconsulting.com`
  - The `analytics_events` table also shows `email_send_attempt` and `email_send_success` events for that address (multiple times).
- That means: the app/backend is not failing at “send time”; the problem is downstream delivery (filtering/quarantine/rejection after SMTP accept), especially common with Outlook/Exchange.

Most likely root causes (Outlook/Exchange-specific)
- Exchange-side filtering/quarantine is capturing or silently dropping the messages (common when the sending domain/IP reputation is low or content triggers filters).
- DMARC/SPF alignment issues if we ever send “From” as anything other than the authenticated SMTP account domain (or if Exchange interprets it as spoofing).
- Content/links can trigger filtering (lots of HTML, buttons, external links, tracking pixels). Even without tracking pixels, some templates can still trip policies.
- Recipient address policies (blocked sender, blocked domain, transport rules, ATP/Safe Links) can block without user-visible spam.

What we’ll do next (fastest way to confirm what’s happening)
1) Confirm whether Exchange is quarantining or rejecting
- Ask you (or the customer’s IT) to check Exchange Admin Center:
  - Quarantine
  - Message trace (search for messages from `soultrainseatery@gmail.com` around the send times)
  - Transport rules / anti-spam policies for the recipient mailbox
- If you can get one data point from Message Trace, it will immediately tell us: “delivered”, “quarantined”, or “dropped/rejected”.

2) Confirm the exact “From” address used for the email type you’re testing
- We currently standardize to `Soul Train’s Eatery <soultrainseatery@gmail.com>`.
- If any path is overriding `from` to a different domain (or a non-existent address), Exchange is much more likely to drop/spoof-block it.
- We’ll verify in code paths that generate estimate emails, quote confirmations, and admin notifications.

Implementation plan (code + configuration) to improve deliverability without breaking functionality
A) Add stronger delivery diagnostics (so we stop guessing)
1) Expand analytics logging in `send-smtp-email`
- Log additional metadata (best-effort, no PII beyond addresses/subject):
  - email “type” (estimate_ready, quote_confirmation, admin_notification, etc.) passed in from callers
  - quote_id / invoice_id correlation (if applicable)
  - the resolved `from` actually used (normalizedFrom / fromParts)
- Benefit: from the admin UI we can see what was sent, which template, and correlate to user actions.

2) Add an “Email Delivery” panel in Admin > Settings (or Admin > Events)
- Pull from `analytics_events` and show:
  - attempts, successes, failures
  - to/from/subject/type/timestamp
- Benefit: lets you confirm “we did send” and when, without digging in logs.

B) Improve deliverability for Outlook/Exchange (highest impact)
1) Move away from “gmail-from-smtp” for production deliverability
- Best practice for Outlook/Exchange deliverability is a verified sending domain with SPF/DKIM/DMARC.
- Two safe options:
  Option 1 (recommended if available): Lovable workspace email domain (transactional sending)
  Option 2: Resend (or similar) with verified domain
- We will keep the current SMTP path as a fallback until the new sender is verified to avoid downtime.

2) Ensure SPF/DKIM/DMARC are set for `soultrainseatery.com`
- Add SPF record for the chosen provider.
- Enable DKIM signing.
- Add a basic DMARC policy (start with `p=none` for monitoring, then tighten later).
- Outcome: Exchange stops treating your messages as suspicious/spoofed.

C) Template hardening for Exchange (lower impact, but helps)
1) Ensure a real plain-text alternative is always included
- Some Exchange configurations are harsher on HTML-only messages.
- We’ll ensure every send includes a meaningful plain-text `content` (not just “view in HTML client”).

2) Reduce “spam-like” signals in certain templates (if needed)
- Avoid overly promotional phrasing in transactional emails.
- Keep consistent footer identity, physical mailing address if required for certain policies, and stable link domains.

What we will not change (to avoid breaking functionality)
- We will not change:
  - database schema
  - quote/invoice workflows
  - internal function names
  - current UI flows for sending previews vs sending real emails
- Any email provider switch will be done behind the existing edge function interfaces so the rest of the app keeps working.

Acceptance criteria (how we’ll know it’s fixed)
- For a test send to `envision@mkqconsulting.com`:
  - Admin “Email Delivery” panel shows attempt + success with the correct email type and sender.
  - Exchange Message Trace confirms “Delivered” (not “Quarantined”).
  - The email appears in Inbox (or at minimum Spam, and we can then tune policies).

Questions I still need answered to proceed efficiently (non-technical)
- Do you (or the customer) have access to Exchange Admin Center to run a Message Trace, or is there an IT contact who can share the trace result?
- Do you want emails to come from `soultrainseatery.com` (recommended) instead of the Gmail address for best deliverability?

Technical work items (for implementation once you approve in Default mode)
- Update `supabase/functions/send-smtp-email/index.ts` to log `email_type` + correlation IDs and include a richer plain-text body.
- Add a small admin UI page/component to view `analytics_events` email logs.
- Add a provider abstraction so we can switch to a verified-domain sender (Lovable domain or Resend) without changing the rest of the app.
