# Payments, Chafers, Labels and Launch Check

## Your decisions
- Booked 14 days or less before the event: 100% due now.
- Booked 15 to 29 days before: 60% now, 40% due 14 days before the event.
- Booked 30+ days before: standard 10% / 40% (30 days prior) / 50% (14 days prior).
- Chafer rental: one $20 rule, the other removed.

Note: today the 60/40 split covers bookings up to 44 days out. With your rule, events booked 30 to 44 days out move to 10/40/50, so the 40% payment comes due within days of booking.

## 1. One payment schedule everywhere
- Put the three rules above in one shared place used by schedule creation, approval, the admin payment section, the PDF, emails and the quote success page.
- Recalculating a schedule keeps dates you typed by hand and never touches paid parts.
- Tests: 14, 15, 29, 30 and 45 days out each give the right split; amounts always add up to the total.

## 2. Protect open payment links and bank transfers
- When an unpaid estimate total changes, close open card payment links so the customer must pay the new amount.
- When a bank transfer is in progress, block price edits and show "Bank payment processing — edits locked until it clears."
- On checkout, recheck the amount against the current balance and refuse old amounts.
- Tests for each case.

## 3. Chafer rental at $20
- Keep one active $20 chafer rule and turn the other off (past invoices stay as they are).
- The pricing assistant can then suggest chafer prices again.

## 4. Same item names everywhere
- One shared naming list for add-ons, chafers, delivery and sides, used by the customer estimate, PDF, emails and staff BEO.
- Old saved names still display correctly.
- Test that each item shows the same name on every document.

## 5. Track whether the email arrived
- Record every estimate email attempt as sent or failed.
- Admin sees "Email failed — resend" when it fails; a failed send does not start the 7-day quote clock.

## 6. Full end-to-end check
- Submit a test quote, price it as admin, send it, open the customer link, check the schedule and totals, and check the staff view, at phone and desktop sizes.
- Remove test data afterwards. Real Stripe charges and real inbox delivery cannot be checked here and will be listed as such.

## Not included
- The 63 older security warnings (separate maintenance pass).

## Technical details
- Shared `paymentSchedule.ts` in `supabase/functions/_shared/` (pure), used by `generate-payment-milestones`, `approve-estimate`, `generate-invoice-from-quote`, `generate-invoice-pdf`, and the frontend `PaymentScheduleSection`/`SuccessStep`.
- Expire Stripe checkout sessions via `stripe.checkout.sessions.expire` when totals change; block edits server-side while a `payment_transactions` row is `processing` (ACH); `create-checkout-session` re-derives the amount from the remaining balance.
- Migration: set one chafer `pricing_rules` row to 2000 cents, `is_active=false` on the duplicate.
- Shared label map in `_shared/`, mirrored in `src/` with a parity test.
- Use `email_send_log` for delivery status; set `sent_at` only after SMTP succeeds.
- Save the schedule and chafer rules to project memory.
