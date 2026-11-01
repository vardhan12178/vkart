const BRAND_COLOR = "#1d1c19";

// Same look and behaviour for every Razorpay window we open (checkout, wallet top-up, Prime):
// the VKart logo (Razorpay only fetches public https URLs), the brand colour, and a confirmation
// before a half-finished payment is closed by accident. Anything passed in wins.
export function withBranding(options = {}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const image = origin.startsWith("https://") ? `${origin}/icon-512.png` : undefined;
  return {
    ...(image ? { image } : {}),
    theme: { color: BRAND_COLOR },
    ...options,
    modal: { confirm_close: true, ...options.modal },
  };
}

// Only the details we actually have, so Razorpay asks for the rest instead of showing blanks.
export function prefillFrom({ name, email, contact } = {}) {
  return Object.fromEntries(Object.entries({ name, email, contact }).filter(([, v]) => v));
}
