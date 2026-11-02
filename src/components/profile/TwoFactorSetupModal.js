import React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../ui/icons";

export default function TwoFactorSetupModal({ twoFA }) {
  if (!twoFA.open) return null;
  const { state, close, confirm, setCode } = twoFA;

  return createPortal(
    <div className="profile-2fa-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-[#171612]/65 backdrop-blur-md p-4 animate-fade-in">
      <div className="profile-2fa-modal isolate w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#fffdf8] text-[#1d1c19] shadow-[0_30px_100px_rgba(0,0,0,.35)]">
        <div className="flex items-center justify-between border-b border-black/[0.08] px-6 py-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a85d37]">
              Account security
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#1d1c19]">
              Set up two-factor authentication
            </h3>
          </div>
          <button
            onClick={close}
            aria-label="Close two-factor setup"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#eee9df] text-[#5f5b52] transition-colors hover:bg-[#1d1c19] hover:text-white"
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center px-6 pb-7 pt-6 text-center">
          {state.qr ? (
            <div className="mb-5 rounded-[1.25rem] border border-black/10 bg-white p-3 shadow-[0_10px_35px_rgba(29,28,25,.1)]">
              <img
                src={state.qr}
                alt="Scan this QR code with your authenticator application"
                className="profile-2fa-qr h-48 w-48 sm:h-52 sm:w-52"
              />
            </div>
          ) : (
            <div className="mb-5 grid h-48 w-48 place-items-center rounded-[1.25rem] border border-black/10 bg-[#eee9df] text-xs font-semibold text-[#6f6b62]">
              Preparing QR code…
            </div>
          )}
          <p className="text-sm font-semibold text-[#34322d]">Scan with Google Authenticator</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#777269]">
            Then enter the six-digit code shown in the app to finish setup.
          </p>

          <div className="mt-5 w-full rounded-xl border border-black/[0.08] bg-[#f1ede5] px-3 py-3">
            <p className="mb-1 text-left text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b867c]">
              Manual setup key
            </p>
            <code className="block truncate text-left font-mono text-xs font-semibold text-[#4a4740]">
              {state.secret}
            </code>
          </div>

          <label
            htmlFor="two-factor-code"
            className="mt-5 self-start text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f6b62]"
          >
            Verification code
          </label>
          <input
            id="two-factor-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000 000"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-center text-xl font-bold tracking-[0.35em] text-[#1d1c19] outline-none focus:border-[#a85d37] focus:ring-4 focus:ring-[#a85d37]/10"
            maxLength={6}
            value={state.code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />

          <button
            onClick={confirm}
            disabled={state.loading || state.code.length !== 6}
            className="mt-4 w-full rounded-xl bg-[#1d1c19] py-3.5 font-bold text-white shadow-lg transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-[#d8d3ca] disabled:text-[#716d64] disabled:shadow-none"
          >
            {state.loading ? "Verifying..." : "Verify & Enable"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
