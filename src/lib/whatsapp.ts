/**
 * WhatsApp deep-link helpers.
 * Format: https://wa.me/<phone>?text=<urlencoded message>
 * The business number is configurable via NEXT_PUBLIC_BUSINESS_WHATSAPP.
 */

const DEFAULT_BUSINESS_WHATSAPP = "573001234567"; // placeholder — documentado en .env.example

/** Strip everything but digits and ensure a Colombian (57) country code. */
export function normalizePhone(raw?: string | null): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  // Local Colombian mobile numbers are 10 digits (e.g. 3001234567).
  if (digits.length === 10) digits = `57${digits}`;
  return digits;
}

export function businessWhatsapp(): string {
  return normalizePhone(
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || DEFAULT_BUSINESS_WHATSAPP,
  );
}

/** Build a wa.me link to an arbitrary phone with an optional prefilled text. */
export function whatsappLink(phone: string, message?: string): string {
  const to = normalizePhone(phone);
  const base = `https://wa.me/${to}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Link to the business number (used in landing + contact CTAs). */
export function businessWhatsappLink(message?: string): string {
  const to = businessWhatsapp();
  const base = `https://wa.me/${to}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
