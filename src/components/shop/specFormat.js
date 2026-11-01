import React from "react";

// Spec names and values as shown on the product and compare pages
const ACRONYMS = /^(ppi|cpu|gpu|ram|ssd|hdr|usb|nfc|os|ip|led|oled|lcd|anc|spf|gps|sim|esim|bt|wifi|ai|mrp)$/i;
export const label = (k) =>
  k.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").map((w) => (ACRONYMS.test(w) ? w.toUpperCase() : w)).join(" ").replace(/^./, (c) => c.toUpperCase());

export function SpecValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.map((x, i) => <li key={i}>{String(x)}</li>)}
      </ul>
    );
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") return Object.entries(value).map(([k, v]) => `${label(k)}: ${v}`).join(", ");
  return String(value);
}
