import React from "react";
import ActiveMembershipBanner from "./prime/ActiveMembershipBanner";
import BenefitsGrid from "./prime/BenefitsGrid";
import PaymentPicker from "./prime/PaymentPicker";
import PlansSection from "./prime/PlansSection";
import PrimeHero from "./prime/PrimeHero";
import PrimeSkeleton from "./prime/PrimeSkeleton";
import usePrime from "./prime/usePrime";

export default function PrimeMembership() {
  const p = usePrime();

  if (p.isLoading) return <PrimeSkeleton />;

  return (
    <div className="premium-page premium-prime min-h-screen bg-[#f6f3ed]">
      <PrimeHero />

      {p.isPrime && p.membershipData?.membership && (
        <ActiveMembershipBanner membership={p.membershipData.membership} />
      )}

      <BenefitsGrid />

      <PlansSection
        plans={p.plans}
        isAuthenticated={p.isAuthenticated}
        isPrime={p.isPrime}
        purchasing={p.purchasing}
        onChoose={(plan) => {
          p.setPaymentMethod("card");
          p.setSelectedPlan(plan);
        }}
      />

      {p.selectedPlan && (
        <PaymentPicker
          plan={p.selectedPlan}
          purchasing={p.purchasing}
          paymentMethod={p.paymentMethod}
          setPaymentMethod={p.setPaymentMethod}
          onClose={() => p.setSelectedPlan(null)}
          onPay={p.handlePurchase}
        />
      )}
    </div>
  );
}
