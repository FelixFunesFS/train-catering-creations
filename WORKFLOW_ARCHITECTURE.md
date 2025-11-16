# Workflow Architecture Documentation

## Overview
This document describes the streamlined workflow architecture implemented in Phase 1-6 cleanup.

## Core Principles
1. **Single Source of Truth**: All workflow status managed through database triggers
2. **Centralized Logic**: `WorkflowStateManager` handles all status transitions
3. **Automatic Sync**: Invoice status changes automatically sync to quotes via trigger
4. **Minimal Redundancy**: Removed duplicate tracking fields and services

## Database Schema

### Primary Tables
- **quote_requests**: Customer quote submissions with workflow_status
- **invoices**: Generated estimates/invoices with workflow_status
- **workflow_state_log**: Audit trail of all status changes
- **workflow_step_completion**: Tracks completed workflow milestones

### Key Views
- **unified_workflow_status**: Consolidated view joining quotes, invoices, and contracts

## Workflow Status Flow

### Quote Workflow Statuses
```
pending → under_review → quoted → estimated → approved → 
awaiting_payment → paid → confirmed → in_progress → completed
                                        ↓
                                   cancelled
```

### Invoice Workflow Statuses
```
draft → pending_review → sent → viewed → approved → 
payment_pending → partially_paid → paid
                                    ↓
                               overdue/cancelled
```

### Automatic Synchronization
When invoice status changes, the database trigger `sync_invoice_to_quote_workflow` automatically updates the related quote:

| Invoice Status | → | Quote Status |
|---------------|---|--------------|
| draft | → | pending |
| pending_review | → | under_review |
| sent | → | estimated |
| viewed | → | estimated |
| approved | → | approved |
| payment_pending | → | awaiting_payment |
| partially_paid | → | awaiting_payment |
| paid | → | paid |
| overdue | → | awaiting_payment |
| cancelled | → | cancelled |

## Core Services

### WorkflowStateManager
Central service for all workflow operations.

**Location**: `src/services/WorkflowStateManager.ts`

**Key Methods**:
- `isValidTransition()`: Validates status transitions
- `updateQuoteStatus()`: Updates quote with validation and logging
- `updateInvoiceStatus()`: Updates invoice with validation and logging
- `getNextQuoteStatuses()`: Returns available transitions
- `getNextInvoiceStatuses()`: Returns available transitions
- `getStatusLabel()`: Converts status to human-readable label

**Usage**:
```typescript
import { WorkflowStateManager } from '@/services/WorkflowStateManager';

// Update quote status
const result = await WorkflowStateManager.updateQuoteStatus(
  quoteId,
  'approved',
  'admin',
  'Customer approved via portal'
);

// Check valid transition
const isValid = WorkflowStateManager.isValidTransition(
  'quote',
  'pending',
  'under_review',
  'admin'
);
```

## React Hooks

### useUnifiedWorkflow
Primary hook for workflow management in React components.

**Location**: `src/hooks/useUnifiedWorkflow.tsx`

**Features**:
- Status updates with toast notifications
- Workflow consistency validation
- Step completion tracking
- Available transition queries

**Usage**:
```typescript
import { useUnifiedWorkflow } from '@/hooks/useUnifiedWorkflow';

function MyComponent() {
  const {
    updateQuoteStatus,
    updateInvoiceStatus,
    validateConsistency,
    getAvailableQuoteTransitions
  } = useUnifiedWorkflow();

  const handleApprove = async () => {
    await updateQuoteStatus(quoteId, 'approved', 'admin');
  };

  const transitions = getAvailableQuoteTransitions('pending');
}
```

## Database Triggers

### sync_invoice_to_quote_workflow
**Purpose**: Automatically sync invoice status changes to related quotes

**Location**: Created in Phase 3 migration

**Behavior**:
- Triggers on invoice.workflow_status UPDATE
- Maps invoice status to appropriate quote status
- Updates quote_requests.workflow_status
- Logs change to workflow_state_log

## Edge Functions

### Core Functions (Retained)
1. **generate-invoice-from-quote**: Creates invoices from quotes
2. **send-customer-portal-email**: Sends estimate access links
3. **workflow-orchestrator**: Handles workflow actions (email, status, reminders)
4. **sync-invoice-with-quote**: Syncs invoice line items with quote

### Removed Functions (Phase 2)
- auto-generate-invoice
- send-invoice
- send-quote-notification
- send-approval-workflow
- send-workflow-email
- facebook-reviews
- generate-test-data
- rate-limit-check
- send-email-fallback
- send-reminders
- send-manual-email
- send-sms
- send-status-notification
- send-test-email
- fix-workflow-status
- update-quote-workflow

## Removed Database Fields (Phase 5)

### From invoices table:
- draft_data
- manual_overrides
- template_metadata
- template_used
- override_reason
- quote_version
- original_quote_id
- last_quote_sync
- email_opened_at
- email_opened_count
- estimate_viewed_at
- estimate_viewed_count
- portal_last_accessed
- portal_access_count
- last_customer_action
- customer_feedback

### From quote_requests table:
- calendar_event_id
- calendar_sync_status
- last_calendar_sync
- theme_colors
- last_customer_interaction

### Removed Tables:
- workflow_state (replaced by unified_workflow_status view)

## Performance Optimizations (Phase 5)

### Indexes Added
```sql
-- Workflow status queries
CREATE INDEX idx_quotes_workflow_status ON quote_requests(workflow_status);
CREATE INDEX idx_invoices_workflow_status ON invoices(workflow_status);
CREATE INDEX idx_workflow_log_entity ON workflow_state_log(entity_type, entity_id);

-- Relationship queries
CREATE INDEX idx_invoices_quote_id ON invoices(quote_request_id);
CREATE INDEX idx_line_items_invoice_id ON invoice_line_items(invoice_id);
```

### Helper Functions
```sql
-- Optimized RLS policy helper
CREATE FUNCTION is_quote_owner(quote_id uuid, user_email text)
RETURNS boolean
-- Used in RLS policies to avoid infinite recursion
```

## Best Practices

### Status Updates
✅ **DO**: Use WorkflowStateManager for all status changes
```typescript
await WorkflowStateManager.updateQuoteStatus(id, newStatus, 'admin', reason);
```

❌ **DON'T**: Update status directly via Supabase client
```typescript
// This bypasses validation and logging
await supabase.from('quote_requests').update({ workflow_status: 'approved' });
```

### Querying Workflow Data
✅ **DO**: Use the unified_workflow_status view
```typescript
const { data } = await supabase
  .from('unified_workflow_status')
  .select('*')
  .eq('quote_id', id);
```

❌ **DON'T**: Manually join quotes and invoices
```typescript
// More complex and error-prone
const { data } = await supabase
  .from('quote_requests')
  .select('*, invoices(*)')
  .eq('id', id);
```

### Consistency Checks
Use the database function to validate workflow state:
```typescript
const { data } = await supabase
  .rpc('check_workflow_consistency', { p_quote_id: quoteId });

if (!data[0].is_consistent) {
  console.log('Issues:', data[0].issues);
}
```

## Migration Path

If you need to add new workflow statuses:

1. **Update Database Enums**
```sql
ALTER TYPE quote_workflow_status ADD VALUE 'new_status';
```

2. **Update TypeScript Types**
```typescript
// In WorkflowStateManager.ts
export type QuoteWorkflowStatus = 
  | 'existing_statuses'
  | 'new_status';
```

3. **Add Transition Rules**
```typescript
const QUOTE_TRANSITIONS: StatusTransition[] = [
  // existing transitions...
  { from: 'previous_status', to: 'new_status', allowedRoles: ['admin'] }
];
```

4. **Update Trigger Mapping** (if needed)
```sql
-- In sync_invoice_to_quote_workflow trigger
WHEN 'invoice_status' THEN 'new_status'::quote_workflow_status
```

## Troubleshooting

### Status won't update
1. Check if transition is valid: `isValidTransition()`
2. Verify user role has permission
3. Check workflow_state_log for errors

### Quote/Invoice out of sync
1. Run consistency check: `check_workflow_consistency()`
2. Review workflow_state_log for last changes
3. Manually trigger sync if needed (should auto-sync via trigger)

### RLS Policy Issues
1. Ensure using security definer functions (not self-referencing queries)
2. Check `is_quote_owner()` and `is_admin()` functions work correctly
3. Test with different user roles

## Future Enhancements

Potential areas for expansion:
1. Workflow automation rules (trigger actions on status change)
2. Custom workflow templates per event type
3. SLA tracking for status transitions
4. Workflow analytics dashboard
5. Status change notifications via email/SMS

## Support

For questions or issues:
- Review this documentation
- Check `workflow_state_log` table for audit trail
- Examine database trigger code in migrations
- Use `check_workflow_consistency()` function for validation
