import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing } from "lucide-react";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";

// "Notify me" for the chosen variant: back in stock when it is sold out, otherwise a price-drop alert.
// Needs a signed-in shopper; the alert shows up in the notification bell when it fires.
export default function AlertButton({ productId, sku, outOfStock }) {
  const signedIn = useSelector((s) => s.auth.isAuthenticated);
  const navigate = useNavigate();
  const kind = outOfStock ? "stock" : "price";
  const [alerts, setAlerts] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!signedIn) {
      setAlerts([]);
      return undefined;
    }
    let live = true;
    axios
      .get("/api/alerts")
      .then((r) => live && setAlerts(r.data?.alerts || []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [signedIn]);

  if (!productId || !sku) return null;
  const existing = alerts.find((a) => a.sku === sku && a.kind === kind);

  const toggle = async () => {
    if (!signedIn) {
      navigate("/login");
      return;
    }
    setBusy(true);
    try {
      if (existing) {
        await axios.delete(`/api/alerts/${existing._id}`);
        setAlerts((list) => list.filter((a) => a._id !== existing._id));
        showToast("Alert removed", "success");
      } else {
        const { data } = await axios.post("/api/alerts", { productId, sku, kind });
        setAlerts((list) => [...list.filter((a) => !(a.sku === sku && a.kind === kind)), data]);
        showToast(
          kind === "stock"
            ? "We'll tell you when it's back in stock"
            : "We'll tell you if the price drops",
          "success"
        );
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Couldn't update the alert", "error");
    } finally {
      setBusy(false);
    }
  };

  const Icon = existing ? BellRing : Bell;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={Boolean(existing)}
      className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${existing ? "border-accent bg-accent/10 text-accent" : "border-line-strong bg-white text-ink hover:border-ink"}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
      {existing
        ? kind === "stock"
          ? "We'll notify you when it's back"
          : "Price alert on · tap to turn off"
        : kind === "stock"
          ? "Notify me when it's back"
          : "Alert me if the price drops"}
    </button>
  );
}
