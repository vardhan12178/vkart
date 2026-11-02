import { useState } from "react";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";
import { formatINR } from "../../utils/format";

// Coupon entry: validate a code, remove it, and browse the public coupons.
export default function usePromo(subtotal) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (!value) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/coupons/validate", { code: value, subtotal });
      if (data.valid) {
        setApplied({ code: data.code, discount: data.discount, description: data.description });
        showToast(`${data.code} applied — ${formatINR(data.discount)} off!`, "success");
      }
    } catch (err) {
      setApplied(null);
      showToast(err?.response?.data?.message || "Invalid coupon code", "error");
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setCode("");
    showToast("Coupon removed", "success");
  };

  const loadCoupons = async () => {
    try {
      const { data } = await axios.get("/api/coupons/public");
      setCoupons(data.coupons || []);
    } catch {
      /* ignore */
    }
  };

  const toggleCoupons = () => {
    if (!showCoupons) loadCoupons();
    setShowCoupons(!showCoupons);
  };

  const pickCoupon = (c) => {
    setCode(c.code);
    setShowCoupons(false);
  };

  return {
    code,
    setCode,
    applied,
    loading,
    coupons,
    showCoupons,
    apply,
    remove,
    toggleCoupons,
    pickCoupon,
  };
}
