import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
}

export function EmbeddedCheckout({ clientSecret, onComplete }: EmbeddedCheckoutProps) {
  const options = { clientSecret, onComplete };

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-4 text-center text-destructive text-sm">
        Stripe publishable key is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.
      </div>
    );
  }

  return (
    <div className="min-h-[300px]">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <StripeEmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
