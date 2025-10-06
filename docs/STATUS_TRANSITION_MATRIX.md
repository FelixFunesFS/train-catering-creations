# 📊 Status Transition Matrix

Complete reference for all valid status transitions in the Soul Train's Eatery system.

---

## **Quote Workflow Status Transitions**

### Current Enum Values
```sql
CREATE TYPE quote_workflow_status AS ENUM (
  'pending',      -- Initial submission
  'estimated',    -- Estimate created and sent
  'confirmed',    -- Payment received + contract signed
  'completed',    -- Event has occurred
  'cancelled'     -- Cancelled by admin or customer
);
```

### Transition Rules

| From Status | To Status | Trigger | Actor | Validation |
|-------------|-----------|---------|-------|------------|
| `pending` | `estimated` | Admin creates estimate | Admin | Invoice must exist |
| `pending` | `cancelled` | Quote declined | Admin | None |
| `estimated` | `confirmed` | Payment received + contract signed | System | Invoice = paid, contract signed |
| `estimated` | `cancelled` | Customer declines | Customer/Admin | None |
| `confirmed` | `completed` | Event date passed | System (auto) | event_date < today |
| Any | `cancelled` | Admin override | Admin | Requires reason |

### Invalid Transitions (Will Be Rejected)

❌ `completed` → `confirmed` (Cannot reverse completion)  
❌ `cancelled` → `estimated` (Cannot reactivate cancelled quote)  
❌ `confirmed` → `pending` (Cannot go backwards)  
❌ `pending` → `completed` (Must go through estimated → confirmed first)

### State Machine Diagram

```
pending ──────────┐
   │              │
   ├─ estimated   │
   │      │       │
   │      ├─ confirmed
   │      │       │
   │      │   completed
   │      │
   └──────┴─ cancelled
```

---

## **Invoice Workflow Status Transitions**

### Current Enum Values
```sql
CREATE TYPE invoice_workflow_status AS ENUM (
  'draft',           -- Being created by admin
  'sent',            -- Sent to customer
  'approved',        -- Customer approved estimate
  'pending_review',  -- Change request submitted
  'paid',            -- Full payment received
  'overdue',         -- Past due date without payment
  'cancelled'        -- Cancelled
);
```

### Transition Rules

| From Status | To Status | Trigger | Actor | Validation |
|-------------|-----------|---------|-------|------------|
| `draft` | `sent` | Admin sends to customer | Admin | Line items exist, totals > 0 |
| `draft` | `cancelled` | Admin cancels | Admin | None |
| `sent` | `approved` | Customer approves | Customer | None |
| `sent` | `pending_review` | Change request submitted | Customer | change_requests entry created |
| `sent` | `overdue` | Past due date | System (auto) | due_date < today |
| `sent` | `cancelled` | Customer declines | Customer/Admin | None |
| `pending_review` | `sent` | Changes applied | Admin | New estimate version created |
| `approved` | `paid` | Payment received | System | payment_milestones all paid |
| `overdue` | `paid` | Late payment | System | payment_milestones all paid |
| `overdue` | `cancelled` | Admin cancels | Admin | None |

### Invalid Transitions

❌ `paid` → `sent` (Cannot unpay)  
❌ `cancelled` → `sent` (Cannot reactivate)  
❌ `pending_review` → `approved` (Must go to sent first)  
❌ `draft` → `paid` (Must be sent and approved first)

### State Machine Diagram

```
draft ────────────┐
   │              │
   ├─ sent ──────┤
   │   │         │
   │   ├─ approved
   │   │      │
   │   │   paid
   │   │
   │   ├─ pending_review ─┐
   │   │                  │
   │   └────────┬─────────┘
   │            │
   │         overdue ─────┤
   │            │         │
   └────────────┴─────────┴─ cancelled
```

---

## **Change Request Workflow Status**

### Current Values (Text Field)
```sql
-- workflow_status column type: TEXT
-- Valid values:
'pending'     -- Awaiting admin review
'approved'    -- Admin approved changes
'rejected'    -- Admin rejected request
```

### Transition Rules

| From Status | To Status | Trigger | Actor | Validation |
|-------------|-----------|---------|-------|------------|
| `pending` | `approved` | Admin approves | Admin | Admin response required |
| `pending` | `rejected` | Admin rejects | Admin | Admin response required |
| `approved` | N/A | Final state | - | - |
| `rejected` | N/A | Final state | - | - |

### Invalid Transitions

❌ `approved` → `pending` (Cannot revert approval)  
❌ `rejected` → `approved` (Cannot change decision)  
❌ `approved` → `rejected` (Final state reached)

### State Machine Diagram

```
       pending
         /  \
        /    \
   approved  rejected
   (final)   (final)
```

---

## **Payment Milestone Status**

### Current Values (Text Field)
```sql
-- status column type: TEXT
-- Valid values:
'pending'     -- Awaiting payment
'paid'        -- Payment received
'overdue'     -- Past due date
'cancelled'   -- Milestone cancelled
```

### Transition Rules

| From Status | To Status | Trigger | Actor | Validation |
|-------------|-----------|---------|-------|------------|
| `pending` | `paid` | Payment succeeds | System | payment_transactions.status = succeeded |
| `pending` | `overdue` | Past due date | System (auto) | due_date < today |
| `pending` | `cancelled` | Invoice cancelled | Admin | Parent invoice cancelled |
| `overdue` | `paid` | Late payment | System | payment_transactions.status = succeeded |
| `overdue` | `cancelled` | Admin cancels | Admin | None |

### Invalid Transitions

❌ `paid` → `pending` (Cannot unpay)  
❌ `paid` → `overdue` (Already paid)  
❌ `cancelled` → `paid` (Cannot pay cancelled)

---

## **Contract Status**

### Current Values (Text Field)
```sql
-- status column type: TEXT
-- Valid values:
'generated'   -- Contract created
'sent'        -- Sent to customer
'signed'      -- Customer signed
'cancelled'   -- Contract voided
```

### Transition Rules

| From Status | To Status | Trigger | Actor | Validation |
|-------------|-----------|---------|-------|------------|
| `generated` | `sent` | Sent to customer | Admin | contract_html not null |
| `sent` | `signed` | Customer signs | Customer | Signature data captured |
| `sent` | `cancelled` | Admin cancels | Admin | None |
| `generated` | `cancelled` | Admin cancels | Admin | None |

### Invalid Transitions

❌ `signed` → `sent` (Cannot unsign)  
❌ `cancelled` → `signed` (Cannot sign voided contract)

---

## **Workflow State Log Reference**

All status changes are logged to `workflow_state_log` table.

### Required Fields
```sql
entity_type         -- 'quote_requests', 'invoices', 'change_requests'
entity_id          -- UUID of the entity
previous_status    -- Status before change
new_status         -- Status after change
changed_by         -- 'admin', 'customer', 'system', specific user ID
change_reason      -- Human-readable reason
```

### Example Entries

```sql
-- Quote estimated
INSERT INTO workflow_state_log (entity_type, entity_id, previous_status, new_status, changed_by, change_reason)
VALUES ('quote_requests', 'quote-123', 'pending', 'estimated', 'admin', 'Estimate created and sent to customer');

-- Invoice paid
INSERT INTO workflow_state_log (entity_type, entity_id, previous_status, new_status, changed_by, change_reason)
VALUES ('invoices', 'inv-456', 'approved', 'paid', 'system', 'Payment received via Stripe');

-- Change request approved
INSERT INTO workflow_state_log (entity_type, entity_id, previous_status, new_status, changed_by, change_reason)
VALUES ('change_requests', 'change-789', 'pending', 'approved', 'admin', 'Minor changes approved automatically (<5%)');
```

---

## **Actor Permissions Matrix**

### Customer Permissions

| Action | Quote | Invoice | Change Request | Payment | Contract |
|--------|-------|---------|----------------|---------|----------|
| View | ✅ (own) | ✅ (via token) | ✅ (own) | ✅ (own) | ✅ (own) |
| Create | ✅ | ❌ | ✅ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve | ❌ | ✅ | ❌ | ❌ | ❌ |
| Pay | ❌ | ❌ | ❌ | ✅ | ❌ |
| Sign | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cancel | ❌ | ❌ | ❌ | ❌ | ❌ |

### Admin Permissions

| Action | Quote | Invoice | Change Request | Payment | Contract |
|--------|-------|---------|----------------|---------|----------|
| View | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (all) |
| Create | ✅ | ✅ | ❌ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ❌ | ✅ |
| Approve | ✅ | ✅ | ✅ | ✅ | ❌ |
| Pay | ✅ (manual) | ❌ | ❌ | ✅ (manual) | ❌ |
| Sign | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cancel | ✅ | ✅ | ✅ | ✅ | ✅ |

### System (Automated) Permissions

| Action | Quote | Invoice | Change Request | Payment | Contract |
|--------|-------|---------|----------------|---------|----------|
| View | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ❌ | ❌ | ❌ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pay | ❌ | ❌ | ❌ | ✅ (via webhook) | ❌ |
| Sign | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cancel | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## **Common Workflow Scenarios**

### Scenario 1: Happy Path (No Changes)
```
Quote: pending → estimated → confirmed → completed
Invoice: draft → sent → approved → paid
```

### Scenario 2: Single Change Request
```
Quote: pending → estimated → estimated (v2) → confirmed → completed
Invoice: draft → sent → pending_review → sent → approved → paid
Change Request: pending → approved
```

### Scenario 3: Multiple Changes
```
Quote: pending → estimated → estimated (v2) → estimated (v3) → confirmed → completed
Invoice: draft → sent → pending_review → sent → pending_review → sent → approved → paid
Change Request 1: pending → approved
Change Request 2: pending → approved
```

### Scenario 4: Late Payment
```
Quote: pending → estimated → confirmed → completed
Invoice: draft → sent → approved → overdue → paid
```

### Scenario 5: Cancelled After Estimate
```
Quote: pending → estimated → cancelled
Invoice: draft → sent → cancelled
```

---

## **Validation Rules (Enforced in Code)**

### Quote Status Changes
```typescript
function validateQuoteStatusChange(
  currentStatus: QuoteWorkflowStatus,
  newStatus: QuoteWorkflowStatus,
  actor: 'admin' | 'customer' | 'system'
): boolean {
  // Only admin can mark as estimated
  if (newStatus === 'estimated' && actor !== 'admin') return false;
  
  // Only system can auto-complete
  if (newStatus === 'completed' && actor !== 'system') return false;
  
  // Cannot go backwards
  const statusOrder = ['pending', 'estimated', 'confirmed', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);
  if (newIndex < currentIndex && newStatus !== 'cancelled') return false;
  
  return true;
}
```

### Invoice Status Changes
```typescript
function validateInvoiceStatusChange(
  currentStatus: InvoiceWorkflowStatus,
  newStatus: InvoiceWorkflowStatus,
  actor: 'admin' | 'customer' | 'system'
): boolean {
  // Only customer can approve
  if (newStatus === 'approved' && actor !== 'customer') return false;
  
  // Only system can mark as paid (via webhook)
  if (newStatus === 'paid' && actor !== 'system') return false;
  
  // Cannot unpay
  if (currentStatus === 'paid' && newStatus !== 'paid') return false;
  
  return true;
}
```

---

## **Monitoring Status Health**

### SQL Queries for Status Monitoring

```sql
-- Check for stuck quotes (estimated for >30 days)
SELECT id, event_name, workflow_status, last_status_change
FROM quote_requests
WHERE workflow_status = 'estimated'
  AND last_status_change < NOW() - INTERVAL '30 days';

-- Check for overdue invoices
SELECT id, invoice_number, workflow_status, due_date
FROM invoices
WHERE workflow_status IN ('sent', 'approved')
  AND due_date < CURRENT_DATE;

-- Check for pending change requests (>7 days)
SELECT id, customer_email, workflow_status, created_at
FROM change_requests
WHERE workflow_status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days';

-- Status distribution for quotes
SELECT workflow_status, COUNT(*) as count
FROM quote_requests
GROUP BY workflow_status
ORDER BY count DESC;

-- Status distribution for invoices
SELECT workflow_status, COUNT(*) as count
FROM invoices
GROUP BY workflow_status
ORDER BY count DESC;
```

---

## **Troubleshooting Status Issues**

### Issue 1: Quote stuck in "estimated"
**Symptoms:** Customer approved but quote still shows estimated  
**Check:**
```sql
SELECT q.id, q.workflow_status, i.workflow_status as invoice_status
FROM quote_requests q
JOIN invoices i ON q.id = i.quote_request_id
WHERE q.id = 'your-quote-id';
```
**Fix:** Check if invoice is paid and contract signed
```sql
UPDATE quote_requests 
SET workflow_status = 'confirmed'
WHERE id = 'your-quote-id'
  AND EXISTS (
    SELECT 1 FROM invoices i 
    WHERE i.quote_request_id = quote_requests.id 
      AND i.workflow_status = 'paid'
  );
```

### Issue 2: Invoice shows "sent" but should be "paid"
**Symptoms:** Payment received but invoice not updating  
**Check:**
```sql
SELECT i.id, i.workflow_status, 
       COUNT(pm.id) as total_milestones,
       COUNT(CASE WHEN pm.status = 'paid' THEN 1 END) as paid_milestones
FROM invoices i
LEFT JOIN payment_milestones pm ON i.id = pm.invoice_id
WHERE i.id = 'your-invoice-id'
GROUP BY i.id, i.workflow_status;
```
**Fix:** Verify all milestones paid, then update
```sql
UPDATE invoices 
SET workflow_status = 'paid'
WHERE id = 'your-invoice-id'
  AND NOT EXISTS (
    SELECT 1 FROM payment_milestones 
    WHERE invoice_id = invoices.id 
      AND status != 'paid'
  );
```

### Issue 3: Change request stuck in "pending"
**Symptoms:** Admin approved but status not updating  
**Check:**
```sql
SELECT * FROM change_requests 
WHERE id = 'your-change-id';
```
**Fix:** Manually update if processor failed
```sql
UPDATE change_requests 
SET workflow_status = 'approved',
    admin_response = 'Approved manually',
    reviewed_at = NOW()
WHERE id = 'your-change-id';
```
