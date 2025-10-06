-- Clean existing test data
DELETE FROM public.change_requests WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
DELETE FROM public.payment_milestones WHERE invoice_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM public.invoice_line_items WHERE invoice_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM public.invoices WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM public.quote_requests WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Insert test data
INSERT INTO public.quote_requests (id, contact_name, email, phone, event_name, event_type,
  event_date, start_time, guest_count, location, service_type, workflow_status,
  estimated_total, created_at, requires_po_number, po_number) VALUES 
('11111111-1111-1111-1111-111111111111', 'Sarah Thompson', 'sarah.thompson@example.com',
 '843-555-0123', 'Thompson Wedding', 'wedding', '2025-12-15', '17:00:00',
 150, 'Boone Hall Plantation, SC', 'full-service', 'estimated', 12500, NOW() - INTERVAL '14 days', false, NULL),
('22222222-2222-2222-2222-222222222222', 'Michelle Rodriguez', 'michelle.rodriguez@charlestontech.com',
 '843-555-0456', 'Tech Picnic', 'corporate', '2025-11-20', '11:00:00',
 75, 'James Island Park, SC', 'delivery-setup', 'confirmed', 4250, NOW() - INTERVAL '7 days', true, 'PO-2025-1147');

INSERT INTO public.invoices (id, quote_request_id, invoice_number, document_type, subtotal,
  tax_amount, total_amount, due_date, workflow_status, customer_access_token,
  token_expires_at, is_draft, payment_schedule_type, created_at, sent_at, viewed_at, estimate_viewed_count) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EST-2025-0001',
 'estimate', 12500, 925, 13425, '2025-11-15', 'approved', gen_random_uuid(), NOW() + INTERVAL '1 year',
 false, 'milestone', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'EST-2025-0002',
 'estimate', 4250, 314, 4564, '2025-11-05', 'sent', gen_random_uuid(), NOW() + INTERVAL '1 year',
 false, 'standard', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 5);

INSERT INTO public.invoice_line_items (invoice_id, category, title, description, quantity, unit_price, total_price) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'proteins', 'Fried Chicken', 'Southern-style', 150, 15, 2250),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sides', 'Collard Greens', 'Traditional', 150, 5, 750),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'proteins', 'Pulled Pork', 'Carolina BBQ', 75, 14, 1050);

INSERT INTO public.payment_milestones (invoice_id, milestone_type, description, percentage,
  amount_cents, due_date, status, is_due_now) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DEPOSIT', 'Initial Deposit', 30, 402750, '2025-10-15', 'pending', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BALANCE', 'Final Payment', 70, 940500, '2025-12-13', 'pending', false);

INSERT INTO public.change_requests (id, invoice_id, customer_email, request_type, priority,
  workflow_status, requested_changes, customer_comments, estimated_cost_change, created_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'sarah.thompson@example.com', 'modification', 'medium', 'pending',
   '{"change_type": "guest_count"}', 'Add 15 more guests?', 1340, NOW() - INTERVAL '2 days');