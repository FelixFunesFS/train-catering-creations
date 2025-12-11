-- Drop existing constraint and add expanded template types
ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_template_type_check;

ALTER TABLE email_templates ADD CONSTRAINT email_templates_template_type_check 
CHECK (template_type = ANY (ARRAY[
  'estimate'::text, 
  'invoice'::text, 
  'reminder'::text, 
  'approval'::text, 
  'contract'::text,
  'quote_confirmation'::text,
  'admin_notification'::text,
  'estimate_ready'::text,
  'approval_confirmation'::text,
  'payment_reminder'::text,
  'payment_confirmation'::text,
  'event_reminder'::text,
  'post_event_followup'::text,
  'custom_response'::text,
  'change_request_response'::text,
  'quote_response'::text
]));

-- Seed email templates for full workflow coverage
INSERT INTO email_templates (template_name, template_type, subject_template, body_template, is_default) VALUES

-- 1. Quote Confirmation (Auto - when customer submits quote)
('Quote Confirmation', 'quote_confirmation', 
'Quote Request Received - {event_name}',
'Hi {customer_name},

Thank you for choosing Soul Train''s Eatery for {event_name}! We''ve received your catering request and our team is excited to review it.

📅 Event Date: {event_date}
👥 Guest Count: {guest_count}
📍 Location: {location}

What happens next:
1. Our team reviews your request (within 24 hours)
2. We''ll send you a detailed estimate with pricing
3. You can approve, request changes, or ask questions through your portal

Questions? Call us at {support_phone} or reply to this email.

We look forward to making your event delicious!

The Soul Train''s Eatery Family',
true),

-- 2. Admin Notification (Auto - notify admin of new quote)
('Admin New Quote Alert', 'admin_notification',
'🚂 New Quote: {event_name} - {customer_name}',
'New catering quote received!

Customer: {customer_name}
Email: {customer_email}
Phone: {customer_phone}

Event: {event_name}
Date: {event_date} at {event_time}
Location: {location}
Guests: {guest_count}
Service: {service_type}

Quick Actions:
- View Quote: {admin_link}

Submitted: {submitted_at}',
true),

-- 3. Estimate Ready (Auto - when admin sends estimate)
('Estimate Ready', 'estimate_ready',
'Your Catering Estimate is Ready - {event_name}',
'Hi {customer_name},

Great news! Your custom estimate for {event_name} is ready for review.

📅 Event: {event_date}
👥 Guests: {guest_count}
💰 Estimated Total: {total_amount}

Click below to view your detailed estimate, approve it, or request changes:

{portal_link}

Your estimate includes:
✓ Full menu breakdown with pricing
✓ Service and setup details  
✓ Payment schedule options

This estimate is valid for 14 days. Secure your date by approving soon!

Questions? Call {support_phone} or reply to this email.

Best regards,
The Soul Train''s Eatery Family',
true),

-- 4. Approval Confirmation (Auto - when customer approves)
('Approval Confirmation', 'approval_confirmation',
'🎉 Estimate Approved - {event_name} is Confirmed!',
'Hi {customer_name},

Wonderful news! Your estimate for {event_name} has been approved.

📅 Event Date: {event_date}
💰 Total: {total_amount}

Next Steps:
1. Complete your deposit payment to secure your date
2. We''ll send event timeline details closer to the date
3. Reach out anytime if you have questions

Pay Your Deposit: {portal_link}

We can''t wait to cater your event!

Warm regards,
The Soul Train''s Eatery Family',
true),

-- 5. Payment Reminder (Auto - before payment due)
('Payment Reminder', 'payment_reminder',
'⏰ Payment Due Soon - {event_name}',
'Hi {customer_name},

This is a friendly reminder that your payment for {event_name} is due soon.

📅 Event Date: {event_date}
💳 Amount Due: {amount_due}
📆 Due Date: {due_date}

Click here to make your payment: {portal_link}

Payment Methods:
✓ Credit/Debit Card
✓ Bank Transfer
✓ Apple Pay / Google Pay

Need to discuss payment options? Call us at {support_phone}.

Thank you,
The Soul Train''s Eatery Family',
true),

-- 6. Payment Confirmation (Auto - after payment received)
('Payment Confirmation', 'payment_confirmation',
'✅ Payment Received - {event_name}',
'Hi {customer_name},

Thank you! We''ve received your payment for {event_name}.

💳 Amount Paid: {amount_paid}
📅 Event Date: {event_date}
📍 Location: {location}

{payment_status_message}

Your Receipt: {portal_link}

What happens next:
- Our team will reach out 1 week before your event
- You''ll receive an event reminder 3 days before

Questions? Call {support_phone} or reply to this email.

Thank you for choosing Soul Train''s Eatery!

Warm regards,
The Soul Train''s Eatery Family',
true),

-- 7. Event Reminder (Auto - 3 days before event)
('Event Reminder', 'event_reminder',
'📅 3 Days Until {event_name}!',
'Hi {customer_name},

Your event is almost here! We''re excited to cater {event_name}.

📅 Date: {event_date}
⏰ Serving Time: {event_time}
📍 Location: {location}
👥 Guest Count: {guest_count}

Our team will arrive at {arrival_time} to set up.

Day-of Contact: {support_phone}

Last-minute changes? Call us immediately at {support_phone}.

See you soon!

The Soul Train''s Eatery Family',
true),

-- 8. Post-Event Follow-up (Auto - day after event)
('Post Event Follow-up', 'post_event_followup',
'Thank You! How Was {event_name}?',
'Hi {customer_name},

Thank you for letting Soul Train''s Eatery be part of {event_name}! We hope everyone enjoyed the food.

We''d love to hear your feedback - simply reply to this email with your thoughts.

Thank you again for choosing us. We hope to serve you at your next event!

Warm regards,
The Soul Train''s Eatery Family',
true),

-- 9. Custom Response (Manual - admin can customize)
('Custom Follow-up', 'custom_response',
'Re: {event_name} - Soul Train''s Eatery',
'Hi {customer_name},

{custom_message}

If you have any questions, please don''t hesitate to reach out at {support_phone} or reply to this email.

Best regards,
The Soul Train''s Eatery Family',
true),

-- 10. Change Request Response
('Change Request Response', 'change_request_response',
'Update on Your Change Request - {event_name}',
'Hi {customer_name},

We''ve reviewed your change request for {event_name}.

{admin_response}

{cost_change_message}

View updated details: {portal_link}

Questions? Call {support_phone} or reply to this email.

Best regards,
The Soul Train''s Eatery Family',
true);