import React from "react";
import { UserRound } from "lucide-react";
import MemberGate from "./MemberGate";

export default function ProfilePreview() {
  return (
    <MemberGate
      eyebrow="Your VKart account"
      title="One quiet place for everything you chose."
      description="Sign in to manage personal details, follow every order, revisit saved products, and control account security."
      primaryLabel="Sign in to your account"
      primaryTo="/login?redirect=/profile"
      secondaryLabel="Create an account"
      secondaryTo="/register"
      icon={UserRound}
      benefits={[
        { title: "Orders at a glance", description: "Track delivery progress and review every purchase." },
        { title: "Your saved edit", description: "Keep a considered shortlist ready for later." },
        { title: "Account protection", description: "Manage passwords and two-factor authentication." },
      ]}
    />
  );
}
