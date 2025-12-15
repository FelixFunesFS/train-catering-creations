/**
 * Generates a Google Maps link from a location string
 * Opens in the user's default maps app on mobile devices
 */
export const formatLocationLink = (location: string | null | undefined): string | null => {
  if (!location?.trim()) return null;
  return `https://maps.google.com/?q=${encodeURIComponent(location.trim())}`;
};

/**
 * Generates a tel: link from a phone number
 * Opens the user's default phone/dialer app
 */
export const formatPhoneLink = (phone: string | null | undefined): string | null => {
  if (!phone?.trim()) return null;
  // Remove all non-numeric characters except + for international
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
};

/**
 * Generates a mailto: link from an email address
 * Opens the user's default email client
 */
export const formatEmailLink = (email: string | null | undefined): string | null => {
  if (!email?.trim()) return null;
  return `mailto:${email.trim()}`;
};
