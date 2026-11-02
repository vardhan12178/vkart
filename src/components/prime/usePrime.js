import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";
import { qk } from "../../query/queryKeys";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { prefillFrom, withBranding } from "../../utils/razorpayBranding";

export default function usePrime() {
  const queryClient = useQueryClient();
  const [purchasing, setPurchasing] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Start fetching Razorpay now so the payment window opens without a wait
  useEffect(() => {
    loadRazorpay().catch(() => {});
  }, []);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const authUser = useSelector((s) => s.auth.user);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: qk.membership.plans,
    queryFn: async () => {
      const res = await axios.get("/api/membership/plans");
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: membership = null, isLoading: statusLoading } = useQuery({
    queryKey: qk.membership.status,
    enabled: isAuthenticated,
    retry: false,
    queryFn: async () => {
      const res = await axios.get("/api/membership/status");
      return res.data || null;
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (planId) => {
      const { data } = await axios.post("/api/membership/purchase", { planId });
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ paymentResponse, planId }) => {
      const res = await axios.post("/api/membership/verify", {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        planId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (!data?.success) return;
      queryClient.setQueryData(qk.membership.status, {
        membership: data.membership,
        isPrime: data.isPrime,
      });
      queryClient.invalidateQueries({ queryKey: qk.membership.status });
      queryClient.invalidateQueries({ queryKey: qk.profile.root });
      showToast("Welcome to VKart Prime!", "success");
    },
  });

  const isLoading = plansLoading || (isAuthenticated && statusLoading);
  const membershipData = isAuthenticated ? membership : null;
  const isPrime = membershipData?.isPrime;

  const handlePurchase = async (planId) => {
    if (!isAuthenticated) {
      showToast("Please login first", "error");
      return;
    }
    setPurchasing(planId);
    try {
      const data = await purchaseMutation.mutateAsync(planId);
      if (!data?.orderId) throw new Error("No orderId returned");

      // Close our own picker now: Razorpay's modal takes over from here.
      setSelectedPlan(null);

      const options = withBranding({
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        prefill: prefillFrom({ name: authUser?.name, email: authUser?.email }),
        amount: data.amount,
        currency: data.currency,
        name: "VKart Prime",
        description: `${data.plan.name} Membership`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await verifyMutation.mutateAsync({
              paymentResponse: response,
              planId,
            });
          } catch {
            showToast("Verification failed", "error");
          } finally {
            setPurchasing(null);
          }
        },
        modal: { ondismiss: () => setPurchasing(null) },
        // Matches the checkout flow's Razorpay look, the primary CTA color
        // rather than Prime's own amber, so the payment step itself feels
        // consistent regardless of which flow got you there.
        theme: { color: "#1D1C19" },
        // Pre-selects the method chosen in the picker below, same as
        // checkout: skips Razorpay's own method-list screen.
        method: {
          card: paymentMethod === "card",
          netbanking: paymentMethod === "netbanking",
          paylater: paymentMethod === "paylater",
          upi: false,
          wallet: false,
          emi: false,
        },
      });

      await loadRazorpay();
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      showToast("Failed to initiate payment", "error");
      setPurchasing(null);
    }
  };

  return {
    plans,
    isLoading,
    isAuthenticated,
    isPrime,
    membershipData,
    purchasing,
    selectedPlan,
    setSelectedPlan,
    paymentMethod,
    setPaymentMethod,
    handlePurchase,
  };
}
