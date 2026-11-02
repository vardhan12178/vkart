import { useEffect, useState } from "react";

// Loads Razorpay's checkout script once and reports when window.Razorpay is usable.
export default function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setLoaded(true);
    s.onerror = () => setLoaded(false);
    document.body.appendChild(s);
  }, []);
  return loaded;
}
