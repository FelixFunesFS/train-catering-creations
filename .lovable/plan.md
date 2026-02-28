

## Plan: Show Cancel Event for All Statuses

### Single change in `EventDetail.tsx` (line 395)

Change the condition from:
```
quote.workflow_status !== 'cancelled' && quote.workflow_status !== 'completed' && quote.workflow_status !== 'pending'
```
to:
```
quote.workflow_status !== 'cancelled'
```

This makes the "Cancel Event" button visible for **all** statuses except `cancelled` (since it's already cancelled). The other status-specific buttons (Mark In Progress, Mark Completed) keep their existing conditional logic inside.

