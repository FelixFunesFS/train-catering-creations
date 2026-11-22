# Selected customer access fixes

## Scope
Only the seven user-selected persisted findings were changed or marked fixed. All other access policies, public functions, payment behavior, and finding statuses were left unchanged.

## Changes
- Five selected customer read policies now use an authenticated identity and verified email ownership instead of caller-supplied request headers. Existing admin/staff policies are unchanged.
- Direct quote inserts now require an authenticated admin. Both public quote forms already use `submit-quote-request`, whose service-side submission behavior is unchanged.
- Direct change-request inserts now require an authenticated admin. Customers use `submit-change-request`, which accepts an invoice-bound access token, checks expiration in a service-only database operation, derives the email from the invoice's inquiry, and always creates a pending request. Customer payloads cannot set email ownership, review fields or an approved status.
- All three active customer change modals pass the existing portal token. The alternative change hook uses the same service. Admin creation without a token continues to use admin-protected direct access.
- Anonymous portal reads still use the existing `get_estimate_with_line_items` operation, which verifies the invoice token and expiration. No customer sign-in requirement was added to the portal.

## Verification
- 75 Bun tests passed, 183 assertions, including request-field whitelisting, credential format, invalid request types/priorities and size limits.
- Rollback-only tests executed against the live database's rules: anonymous forged headers reveal no rows across the five protected tables; anonymous/non-admin direct quote and change inserts are denied; the elevated submission helper is not callable anonymously; unrelated signed-in customers cannot read the fixture; verified owners can read their own rows; valid portal links still work; wrong/expired tokens cannot submit; server-derived ownership and pending status are enforced; admin reads/inserts still work. No fixtures retained (verified count: zero).
- Deployed submission service rejects an invalid invoice/token with 403 and forged ownership/status fields with 400. Requests used fabricated identifiers and did not modify customer records.
- Re-check scan returned none of the seven selected findings. One unrelated leaked-password setting finding remains untouched.
- Database linter returned the same 63 pre-existing warnings; no new security warnings remain. Those older warnings were not fixed or ignored in this request.
- Preview reported build OK; diff/whitespace checks passed.

## Limits
Authenticated browser end-to-end tests are unavailable for this externally managed Supabase project. Valid customer submission was checked using rollback-only database fixtures; the deployed service's rejection paths were exercised without real customer tokens. No live email, payment, quote or change request was created for testing.

Security guidance: https://docs.lovable.dev/features/security