import React, { useState } from "react";
import { ClockIcon, CreditCardIcon, LandmarkIcon } from "../ui/icons";

const TITLES = { card: "Use test card", netbanking: "Test netbanking", paylater: "Test PayLater" };

function Hint({ icon: Icon, title, children }) {
  return (
    <div className="px-3 pb-3 flex items-start gap-2.5 animate-fade-up-quick">
      <div className="p-1.5 bg-white/10 rounded-md shrink-0">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="text-[11px] text-muted-ondark">
        <p className="text-white font-bold text-xs mb-0.5">{title}</p>
        {children}
      </div>
    </div>
  );
}

// Collapsible test credentials for whichever payment method is selected.
export default function TestModeHelp({ method }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl mb-3.5 sm:mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 text-left"
      >
        <span className="text-[10px] sm:text-xs font-bold text-muted-ondark uppercase tracking-wider truncate">
          Test Mode: {TITLES[method] || TITLES.paylater}
        </span>
        <span
          className={`text-muted-ondark text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && method === "netbanking" && (
        <Hint icon={LandmarkIcon} title="Test bank">
          <p className="mb-0.5">Pick any bank — test mode auto-approves it.</p>
          <p className="mt-0.5 text-ok">No real bank login needed</p>
        </Hint>
      )}

      {open && method === "paylater" && (
        <Hint icon={ClockIcon} title="Test PayLater provider">
          <p className="mb-0.5">Pick any provider — test mode auto-approves it.</p>
          <p className="mt-0.5 text-ok">No real account needed</p>
        </Hint>
      )}

      {open && method === "card" && (
        <Hint icon={CreditCardIcon} title="RuPay Test Card">
          <p className="mb-0.5">
            Card: <span className="text-white font-mono font-semibold">6070 1010 1010 1010</span>
          </p>
          <div className="flex gap-2.5">
            <p>
              Exp: <span className="text-white">12/34</span>
            </p>
            <p>
              CVV: <span className="text-white">123</span>
            </p>
          </div>
          <p className="mt-0.5 text-ok">OTP: 123456</p>
        </Hint>
      )}
    </div>
  );
}
