# End-to-End Workflow Testing Checklist

## Phase 0: Emergency Fixes ✅
- [x] Added `/estimate` route to App.tsx
- [x] Fixed `invoice.status` → `invoice.workflow_status` in CustomerEstimateView.tsx
- [x] Fixed `status` → `workflowStatus` prop in EstimateActions.tsx

## Phase 1: Status Consolidation (In Progress)
- [ ] Search and replace all remaining `.status` references
- [ ] Update all database queries to use `workflow_status`
- [ ] Remove old status column references from UI components

## Phase 2: Smart Change Approval ✅
- [x] Updated ChangeRequestProcessor.ts with smart status logic
- [x] Implemented 5% cost threshold for auto-approval
- [x] Enhanced email notifications with permanent link messaging

## Phase 3: Persistent Customer Portal
- [ ] Extend token expiry to 1 year (currently 90 days)
- [ ] Update email templates to emphasize permanent link
- [ ] Add real-time status updates to customer portal

## Phase 4: Edge Function Activation ✅
- [x] Created cron job SQL migration
- [ ] Deploy migration to enable scheduled functions
- [ ] Verify auto-workflow-manager runs every 15 minutes
- [ ] Verify token-renewal-manager runs daily at 2 AM
- [ ] Monitor edge function logs for execution

## Phase 5: End-to-End Testing

### Test 1: New Quote Submission
- [ ] Submit new quote request via public form
- [ ] Verify quote appears in admin dashboard
- [ ] Verify workflow_status = 'pending'

### Test 2: Quote to Estimate Flow
- [ ] Admin completes pricing
- [ ] Generate estimate
- [ ] Verify invoice.workflow_status = 'draft'
- [ ] Send estimate to customer
- [ ] Verify invoice.workflow_status = 'sent'
- [ ] Verify customer receives email with estimate link

### Test 3: Customer Estimate Access
- [ ] Customer clicks estimate link
- [ ] Verify `/estimate?token=XXX` route works
- [ ] Verify estimate details display correctly
- [ ] Verify line items show properly
- [ ] Verify payment milestones display

### Test 4: Customer Accepts Estimate
- [ ] Customer clicks "Accept This Estimate"
- [ ] Verify invoice.workflow_status changes to 'approved'
- [ ] Verify quote_requests.workflow_status changes to 'estimated'
- [ ] Verify admin sees updated status
- [ ] Verify confirmation message displays

### Test 5: Customer Requests Changes
- [ ] Customer clicks "Request Changes"
- [ ] Fill out change request form
- [ ] Submit change request
- [ ] Verify change_requests record created
- [ ] Verify change_requests.status = 'pending'
- [ ] Verify invoice.workflow_status = 'pending_review'
- [ ] Verify admin receives notification

### Test 6: Admin Approves Change (Minimal Cost)
- [ ] Admin reviews change request
- [ ] Apply changes with <5% cost difference
- [ ] Verify new estimate version created
- [ ] Verify invoice.workflow_status = 'approved' (stays approved)
- [ ] Verify customer receives email notification
- [ ] Verify estimate link still works (same token)
- [ ] Customer sees updated estimate

### Test 7: Admin Approves Change (Significant Cost)
- [ ] Admin reviews change request
- [ ] Apply changes with >5% cost difference
- [ ] Verify new estimate version created
- [ ] Verify invoice.workflow_status = 'sent' (requires re-review)
- [ ] Verify customer receives email notification
- [ ] Verify estimate link still works (same token)
- [ ] Customer must re-accept estimate

### Test 8: Admin Rejects Change
- [ ] Admin rejects change request
- [ ] Verify change_requests.status = 'rejected'
- [ ] Verify customer receives rejection email
- [ ] Verify invoice stays in current state

### Test 9: Payment Flow
- [ ] Customer with approved estimate
- [ ] Generate payment milestones
- [ ] Send payment link
- [ ] Customer completes payment
- [ ] Verify payment_milestones.status = 'completed'
- [ ] Verify invoice.workflow_status = 'paid'
- [ ] Verify quote_requests.workflow_status = 'confirmed'

### Test 10: Status Tracking
- [ ] View workflow_state_log for quote
- [ ] Verify all status transitions logged
- [ ] Verify changed_by populated correctly
- [ ] Verify timestamps accurate

### Test 11: Edge Function Automation
- [ ] Wait 15 minutes after estimate sent
- [ ] Check auto-workflow-manager logs
- [ ] Verify automated status checks run
- [ ] Wait for 2 AM next day
- [ ] Check token-renewal-manager logs
- [ ] Verify token expiry warnings sent if needed

### Test 12: Multiple Change Request Cycles
- [ ] Customer accepts estimate
- [ ] Customer requests change #1
- [ ] Admin approves change #1
- [ ] Customer requests change #2
- [ ] Admin approves change #2
- [ ] Verify estimate_versions has 2+ versions
- [ ] Verify all changes reflected in current estimate
- [ ] Verify same token works throughout

## Known Issues to Monitor
1. Token regeneration on every change (should now use same token)
2. Status field confusion (being phased out)
3. Edge functions not running (cron jobs now configured)
4. Customer confusion with multiple links (now single permanent link)

## Success Criteria
✅ Customer can access estimate via single permanent link
✅ All status transitions use workflow_status field
✅ Change requests create versions without breaking link
✅ Smart approval logic keeps status when appropriate
✅ Email notifications reference permanent portal
✅ Edge functions run on schedule automatically
✅ All workflows complete end-to-end without errors
