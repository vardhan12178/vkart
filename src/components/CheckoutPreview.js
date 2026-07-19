import React from "react";
import { ShieldCheck } from "lucide-react";
import MemberGate from "./MemberGate";

export default function CheckoutPreview() {
  return (
    <MemberGate
      eyebrow="Secure checkout"
      title="A clear final step, with everything protected."
      description="Sign in before checkout so we can verify your bag, delivery details, available benefits, and payment securely."
      primaryLabel="Sign in to continue"
      primaryTo="/login?redirect=/checkout"
      secondaryLabel="Return to your bag"
      secondaryTo="/cart"
      icon={ShieldCheck}
      benefits={[
        { title: "Verified totals", description: "Prices, offers, and wallet benefits are checked before payment." },
        { title: "Secure payment", description: "Protected payment verification from bag to confirmation." },
        { title: "Order continuity", description: "Receipts and delivery updates stay connected to your account." },
      ]}
    />
  );
}
