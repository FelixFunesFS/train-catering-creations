

## Add Stripe Publishable Key to Project

### What needs to happen
Add your Stripe publishable key to the `.env` file so the Embedded Checkout component can initialize Stripe on the frontend.

### Change
**File:** `.env`
- Add: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51JtxCsEGJ2qBY8JywiHkVi5uaBHUlucYjT2GcV721WqUvijhpUPcVgpnMxVs2FCDYhJEAsnuE7ZpHaunW50VhcQS009v7vsxqw`

This is the same Stripe account whose secret key is already stored in Supabase secrets. No new keys or accounts are needed -- this is simply the public counterpart that the browser needs to render the card form.

### What this unlocks
Once added, the "Take Payment" button in the admin Record Payment dialog will render the Stripe card form directly inside the dialog instead of opening a new browser tab.

