const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let pending = null;

// Loads Razorpay Checkout when a page is about to take a payment, so every other page
// skips about 280 KB of third-party code (and its cookie).
export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(window.Razorpay);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => {
      pending = null;
      s.remove();
      reject(new Error("Could not load Razorpay"));
    };
    document.body.appendChild(s);
  });
  return pending;
}
