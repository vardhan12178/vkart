import { useState } from "react";
import axios from "../axiosInstance";

const IDLE = { qr: "", secret: "", code: "", loading: false, disabling: false };

// Set up and turn off authenticator-app two-factor sign-in.
export default function useTwoFactor({ patchUser, notify }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(IDLE);

  const start = async () => {
    try {
      setState((s) => ({ ...s, loading: true, code: "" }));
      const res = await axios.post("/api/2fa/setup");
      setState((s) => ({
        ...s,
        loading: false,
        qr: res.data?.qr || "",
        secret: res.data?.manualEntryKey || "",
      }));
      setOpen(true);
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to start 2FA setup.");
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const confirm = async () => {
    const code = String(state.code || "").trim();
    if (!/^\d{6}$/.test(code)) {
      notify("error", "Enter a valid 6-digit code.");
      return;
    }
    try {
      setState((s) => ({ ...s, loading: true }));
      await axios.post("/api/2fa/enable", { token: code, secret: state.secret });
      patchUser({ twoFactorEnabled: true });
      setOpen(false);
      setState(IDLE);
      notify("success", "Two-factor authentication enabled.");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Invalid code. Try again.");
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const disable = async () => {
    try {
      setState((s) => ({ ...s, disabling: true }));
      await axios.post("/api/2fa/disable");
      patchUser({ twoFactorEnabled: false });
      notify("success", "Two-factor authentication disabled.");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to disable 2FA.");
    } finally {
      setState((s) => ({ ...s, disabling: false }));
    }
  };

  return {
    open,
    state,
    start,
    confirm,
    disable,
    close: () => setOpen(false),
    setCode: (code) => setState((s) => ({ ...s, code })),
  };
}
