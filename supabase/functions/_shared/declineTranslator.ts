/**
 * Translates raw Stripe decline codes into customer-friendly messages
 * and admin-readable summaries.
 *
 * Used by:
 *  - create-checkout-session (when superseding pending sessions)
 *  - stripe-webhook (when handling expired/failed sessions)
 *  - get-payment-failure-reason (customer-facing lookup)
 */

import Stripe from "https://esm.sh/stripe@14.21.0";

export interface DeclineDetails {
  /** Short admin-facing label, e.g. "Card declined: card_velocity_exceeded" */
  adminReason: string;
  /** Customer-friendly headline, e.g. "Your bank declined this payment" */
  customerHeadline: string;
  /** Customer-friendly explanation paragraph */
  customerExplanation: string;
  /** Specific next-step suggestions for the customer */
  customerActions: string[];
  /** Raw Stripe decline code, if known */
  declineCode: string | null;
  /** True when ZIP/postal code verification failed */
  zipMismatch: boolean;
}

/**
 * Maps a raw Stripe decline_code to a friendly explanation.
 * Falls back to a generic message when the code is unknown.
 */
export function translateDeclineCode(
  declineCode: string | null,
  rawMessage?: string | null,
  zipMismatch = false
): DeclineDetails {
  const code = (declineCode || "").toLowerCase();

  let customerHeadline = "Your bank declined this payment";
  let customerExplanation =
    "No charge was made. Your card issuer did not approve this transaction.";
  const customerActions: string[] = [];

  switch (code) {
    case "card_velocity_exceeded":
      customerExplanation =
        "Your bank may have blocked this payment because of a daily spending limit or a fraud-prevention rule on the card. No charge was made.";
      customerActions.push(
        "Call the phone number on the back of your card and authorize the charge to Soul Train's Eatery."
      );
      customerActions.push(
        "Ask your bank to temporarily raise the daily limit if needed."
      );
      customerActions.push(
        "After the bank approves it, return to the estimate and try again."
      );
      break;

    case "insufficient_funds":
      customerExplanation =
        "The card did not have enough available funds to complete this payment. No charge was made.";
      customerActions.push("Use a different card or payment method.");
      customerActions.push(
        "Or split the payment into smaller amounts using the partial payment option."
      );
      break;

    case "incorrect_cvc":
    case "invalid_cvc":
      customerExplanation =
        "The security code (CVC) entered did not match what your bank has on file.";
      customerActions.push(
        "Re-enter the 3-digit code on the back of the card (4 digits on the front for Amex)."
      );
      break;

    case "expired_card":
      customerExplanation = "The card has expired.";
      customerActions.push("Use a different card with a current expiration date.");
      break;

    case "incorrect_number":
    case "invalid_number":
      customerExplanation = "The card number entered was not valid.";
      customerActions.push("Double-check the card number and try again.");
      break;

    case "do_not_honor":
    case "generic_decline":
    case "transaction_not_allowed":
      customerExplanation =
        "Your bank declined the charge without giving a specific reason. This is common for large or unusual purchases.";
      customerActions.push(
        "Call your bank and authorize the charge to Soul Train's Eatery, then try again."
      );
      customerActions.push("Or use a different card.");
      break;

    case "lost_card":
    case "stolen_card":
    case "pickup_card":
      customerHeadline = "This card cannot be used";
      customerExplanation =
        "Your bank reported this card as unavailable. No charge was made.";
      customerActions.push("Use a different card.");
      customerActions.push("Contact your bank if you believe this is an error.");
      break;

    case "fraudulent":
    case "merchant_blacklist":
      customerHeadline = "Payment blocked by your bank";
      customerExplanation =
        "Your bank's fraud system blocked this charge as a precaution. No charge was made.";
      customerActions.push(
        "Call the phone number on the back of your card and confirm the charge to Soul Train's Eatery is legitimate."
      );
      customerActions.push("Then try the payment again.");
      break;

    case "":
      // No code returned by Stripe
      customerExplanation =
        "The payment did not complete. No charge was made to your account.";
      customerActions.push("Verify your card details and billing ZIP code.");
      customerActions.push("Try again, or use a different card.");
      break;

    default:
      customerExplanation = `Your bank declined the payment (${code}). No charge was made.`;
      customerActions.push(
        "Call the phone number on the back of your card and authorize the charge to Soul Train's Eatery."
      );
      customerActions.push("Then return to the estimate and try again.");
      break;
  }

  if (zipMismatch) {
    customerActions.push(
      "Confirm the billing ZIP code you entered matches the ZIP code on file with your bank."
    );
  }

  customerActions.push(
    "Need help? Call Soul Train's Eatery at (843) 970-0265 or email soultrainseatery@gmail.com."
  );

  const adminReason = code
    ? `Card declined: ${code}${rawMessage ? ` - ${rawMessage}` : ""}${
        zipMismatch ? " (ZIP check failed)" : ""
      }`
    : rawMessage
    ? `Payment failed: ${rawMessage}`
    : "Payment failed (no decline code returned)";

  return {
    adminReason,
    customerHeadline,
    customerExplanation,
    customerActions,
    declineCode: declineCode || null,
    zipMismatch,
  };
}

/**
 * Inspects a Stripe Checkout Session's payment intent to extract a decline reason.
 * Returns null if the session has no failed payment attempt.
 */
export async function getDeclineFromSession(
  stripe: Stripe,
  sessionId: string
): Promise<DeclineDetails | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.payment_intent) return null;

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    const lastError = paymentIntent.last_payment_error;
    if (!lastError) return null;

    const declineCode = lastError.decline_code || lastError.code || null;
    const message = lastError.message || null;

    // Detect ZIP failure from payment method checks
    let zipMismatch = false;
    const pm = lastError.payment_method as Stripe.PaymentMethod | undefined;
    if (pm?.card?.checks?.address_postal_code_check === "fail") {
      zipMismatch = true;
    }

    return translateDeclineCode(declineCode, message, zipMismatch);
  } catch (err) {
    console.error("[declineTranslator] Failed to retrieve session", err);
    return null;
  }
}
