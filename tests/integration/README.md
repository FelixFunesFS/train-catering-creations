# Integration Tests

This directory contains integration tests for the complete quote-to-payment workflow.

## Structure

```
tests/
├── helpers/
│   └── supabaseTestClient.ts    # Database test utilities and cleanup
├── fixtures/
│   ├── mockQuotes.ts             # Quote request test data factories
│   └── mockInvoices.ts           # Invoice test data factories
├── integration/
│   ├── README.md                 # This file
│   ├── quote-submission.test.ts  # Quote creation tests
│   ├── invoice-generation.test.ts # Invoice/line items tests
│   ├── payment-workflow.test.ts   # Payment milestone tests
│   └── complete-workflow.test.ts  # End-to-end workflow tests
└── setup.integration.ts          # Test environment setup
```

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npx vitest run tests/integration/quote-submission.test.ts

# Run in watch mode
npx vitest --config vitest.integration.config.ts
```

## Writing Tests

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { testSupabase, TestDataCleanup } from '../helpers/supabaseTestClient';
import { createCorporateQuote } from '../fixtures/mockQuotes';

describe('Quote Submission Flow', () => {
  const cleanup = new TestDataCleanup();

  afterEach(async () => {
    await cleanup.cleanupAll();
  });

  it('should create a quote with pending status', async () => {
    const quoteData = createCorporateQuote();
    
    const { data, error } = await testSupabase
      .from('quote_requests')
      .insert(quoteData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.workflow_status).toBe('pending');
    
    // Track for cleanup
    cleanup.trackQuote(data.id);
  });
});
```

## Test Data Cleanup

All tests **must** clean up their data. Use `TestDataCleanup`:

```typescript
const cleanup = new TestDataCleanup();

// Track created records
cleanup.trackQuote(quoteId);
cleanup.trackInvoice(invoiceId);

// Clean up after test
await cleanup.cleanupAll();
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data in `afterEach` or `afterAll`
3. **Unique Data**: Use `generateTestEmail()` for unique test emails
4. **Assertions**: Test both success and error cases
5. **Timeouts**: Database operations have 30s timeout - use `waitForDb()` if needed
6. **Sequential**: Integration tests run sequentially to avoid race conditions

## Testing Checklist

- [ ] Quote submission creates record with correct status
- [ ] Invoice generation creates invoice + line items
- [ ] Line items match menu selections from quote
- [ ] Tax calculation correct (0% for gov, 8% for others)
- [ ] Payment milestones generated (50/50 or Net30)
- [ ] Payment updates milestone status
- [ ] Full payment updates invoice to 'paid'
- [ ] Invoice status syncs to quote status
- [ ] Change requests create proper records

## Debugging

Enable verbose logging:
```typescript
// In your test file
const { data, error } = await testSupabase
  .from('quote_requests')
  .insert(quoteData)
  .select();

if (error) {
  console.error('Full error:', JSON.stringify(error, null, 2));
}
```

Check database state:
```typescript
// Query to see what was actually created
const { data } = await testSupabase
  .from('quote_requests')
  .select('*')
  .eq('email', 'test@example.com');

console.log('Quote in DB:', data);
```
