import { useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { clearCart } from "../../redux/cartSlice";
import { showToast } from "../../utils/toast";
import { buildSecureOrderPayload } from "../../utils/orderPayload";
import { qk } from "../../query/queryKeys";
import { buildOrderLines } from "./cartMath";

// Sends the order to the server once payment is done. Returns the new order's id.
export default function useOrderPlacement(cartItems, promoCode) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async (details) => {
    setPlacing(true);
    setError(null);
    try {
      const orderData = buildSecureOrderPayload({
        productsPayload: buildOrderLines(cartItems),
        shippingAddress: details.address,
        promoCode,
        paymentVerificationToken: details?.payment?.verificationToken,
        walletUsed: details?.walletUsed,
      });

      const res = await axios.post("/api/orders", orderData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.profile.orders }),
        queryClient.invalidateQueries({ queryKey: qk.profile.root }),
        queryClient.invalidateQueries({ queryKey: qk.profile.wallet }),
      ]);
      dispatch(clearCart());
      showToast("Order placed successfully", "success");
      return res?.data?._id || res?.data?.orderId || null;
    } catch (e) {
      // A duplicate submit comes back as 409 with the existing order
      const existingId = e?.response?.status === 409 ? e?.response?.data?.orderId : null;
      if (existingId) {
        dispatch(clearCart());
        await queryClient.invalidateQueries({ queryKey: qk.profile.orders });
        return existingId;
      }
      const msg = e?.response?.data?.message || e?.message || "Failed to place the order.";
      setError(msg);
      showToast(msg, "error");
      throw e;
    } finally {
      setPlacing(false);
    }
  };

  return { placeOrder, placing, error };
}
