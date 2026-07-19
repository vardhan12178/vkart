import React from "react";
import { ShoppingBag } from "lucide-react";
import MemberGate from "./MemberGate";

export default function CartPreview() {
  return (
    <MemberGate
      eyebrow="Your saved bag"
      title="Pick up exactly where you left off."
      description="Sign in to restore your bag, keep quantities in sync, and move smoothly from considered choices to secure checkout."
      primaryLabel="Sign in to your bag"
      primaryTo="/login?redirect=/cart"
      secondaryLabel="Browse the collection"
      secondaryTo="/products"
      icon={ShoppingBag}
      benefits={[
        { title: "Synced across devices", description: "Your selected pieces stay together wherever you shop." },
        { title: "Protected checkout", description: "Saved details and payments remain securely handled." },
        { title: "No pressure", description: "Return when you are ready and continue in a single step." },
      ]}
    />
  );
}
