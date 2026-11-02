import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { buildVerifiedPaymentMeta, extractVerificationToken } from "../../utils/checkoutPayment";
import { prefillFrom, withBranding } from "../../utils/razorpayBranding";
import { qk } from "../../query/queryKeys";
import useRazorpayScript from "./useRazorpayScript";

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || fallback;

const NOT_READY = "Razorpay not ready. Check REACT_APP_RAZORPAY_KEY_ID.";

// Wallet balance, placing the order (wallet-only or through Razorpay) and wallet top-ups.
export default function usePayment({
  isAuthenticated,
  totalAmount,
  form, // { data, fullAddress } from useCheckoutForm
  onOrderPlaced,
  useWallet,
  paymentMethod,
  saveAddress,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rzpReady = useRazorpayScript();
  const RZP_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const { data: wallet = null } = useQuery({
    queryKey: qk.profile.wallet,
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await axios.get("/api/wallet");
      return res.data || null;
    },
  });
  const walletBalance = Number(wallet?.balance) || 0;

  const grandTotal = Number(totalAmount) || 0;
  const walletApplied = useWallet ? Math.min(walletBalance, grandTotal) : 0;
  const payable = Math.max(0, grandTotal - walletApplied);

  const saveAddressMutation = useMutation({
    mutationFn: async (payload) => axios.post("/api/profile/addresses", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.profile.addresses }),
  });
  const createTopup = useMutation({
    mutationFn: async (amount) => (await axios.post("/api/wallet/topup", { amount })).data,
  });
  const verifyTopup = useMutation({
    mutationFn: async ({ response, amount }) =>
      axios.post("/api/wallet/verify", { ...response, amount }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.profile.wallet }),
  });

  // Save the entered address after a successful order. Non-fatal: the order itself carries
  // the address string, so a failure here only costs the shopper a convenience next time.
  const persistAddressIfNeeded = async () => {
    if (!(isAuthenticated && saveAddress)) return;
    const { data } = form;
    try {
      await saveAddressMutation.mutateAsync({
        label: "Default",
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: "India",
        isDefault: true,
      });
    } catch (err) {
      console.warn("Address save failed (non-fatal):", err);
    }
  };

  const finish = async (details) => {
    const orderId = await onOrderPlaced?.(details);
    await persistAddressIfNeeded();
    setBusy(false);
    navigate(orderId ? `/order-success/${orderId}` : "/orders", { replace: true });
  };

  // Confirm & pay: wallet-only orders skip Razorpay entirely
  const placeOrder = async ({ onStart } = {}) => {
    if (!rzpReady || !RZP_KEY) return setStatus(NOT_READY);
    setStatus("");
    setBusy(true);
    onStart?.();

    try {
      if (payable === 0) {
        await finish({ address: form.fullAddress, method: "WALLET", walletUsed: walletApplied });
        return;
      }

      const res = await axios.post("/api/razorpay/create-order", {
        amount: payable,
        currency: "INR",
      });
      if (!res?.data?.success || !res.data.orderId) throw new Error("Failed to create order");
      const { orderId, amount: amountPaise, currency } = res.data;
      const { data } = form;

      const options = withBranding({
        key: RZP_KEY,
        amount: amountPaise,
        currency,
        name: "VKart (Test)",
        description: "Secure Payment via Razorpay",
        order_id: orderId,
        prefill: {
          name: data.fullName || "VKart User",
          email: data.email || "user@example.com",
          contact: data.phone || "9999999999",
        },
        notes: { shipping_address: form.fullAddress },
        // Closing the window (after the confirm prompt) frees the Pay button again
        modal: { ondismiss: () => setBusy(false) },
        theme: { color: "#1d1c19" },
        // Pre-selects the method chosen in our own picker so Razorpay opens straight on that
        // method's form. UPI is deliberately off: it isn't enabled on this Razorpay account,
        // so offering it would dead-end with "No appropriate payment method found."
        method: {
          card: paymentMethod === "card",
          netbanking: paymentMethod === "netbanking",
          paylater: paymentMethod === "paylater",
          upi: false,
          wallet: false,
          emi: false,
        },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post("/api/razorpay/verify", response);
            await finish({
              address: form.fullAddress,
              method: paymentMethod.toUpperCase(),
              walletUsed: walletApplied,
              payment: buildVerifiedPaymentMeta(response, extractVerificationToken(verifyRes)),
            });
          } catch (err) {
            console.error(err);
            setBusy(false);
            setStatus(getErrorMessage(err, "Payment verification failed. Please contact support."));
          }
        },
      });

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setBusy(false);
        setStatus("Payment failed. Please try again.");
      });
      rzp.on("modal.closed", () => setBusy(false));
      rzp.open();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setStatus(getErrorMessage(err, "Unable to initialize payment."));
    }
  };

  // Add money to the wallet through Razorpay; `onDone` runs once the payment is verified
  const topUpWallet = async (amount, onDone) => {
    if (!amount || amount <= 0) return;
    if (!rzpReady || !RZP_KEY) return setStatus(NOT_READY);
    setStatus("");
    try {
      const { orderId, amount: amountPaise, currency } = await createTopup.mutateAsync(amount);
      const { data } = form;
      const options = withBranding({
        key: RZP_KEY,
        amount: amountPaise,
        currency,
        name: "VKart Wallet",
        description: "Wallet Top-up",
        order_id: orderId,
        prefill: prefillFrom({ name: data.fullName, email: data.email, contact: data.phone }),
        theme: { color: "#1d1c19" },
        handler: async (response) => {
          try {
            await verifyTopup.mutateAsync({ response, amount });
            onDone?.();
            setStatus("");
          } catch (err) {
            setStatus(getErrorMessage(err, "Wallet top-up verification failed."));
          }
        },
      });
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => setStatus("Wallet top-up payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      setStatus(getErrorMessage(err, "Wallet top-up failed."));
    }
  };

  return {
    rzpReady,
    busy,
    status,
    walletBalance,
    walletApplied,
    payable,
    placeOrder,
    topUpWallet,
  };
}
