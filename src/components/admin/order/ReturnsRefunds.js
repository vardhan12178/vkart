import React from "react";

const RETURN_STEPS = ["APPROVED", "PICKED", "RECEIVED", "REJECTED", "CLOSED"];

const Fact = ({ label, children }) => (
  <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
    <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{label}</div>
    <div className="text-xs sm:text-sm font-semibold text-slate-900">{children}</div>
  </div>
);

const Hint = ({ children }) => <p className="text-xs text-slate-400 italic">{children}</p>;

export default function ReturnsRefunds({ order, canWrite, actions }) {
  const returnRequested = order.returnStatus && order.returnStatus !== "NONE";
  const refundEligible =
    order.stage === "CANCELLED" || ["APPROVED", "PICKED", "RECEIVED"].includes(order.returnStatus);
  const refundHandled =
    order.refundStatus && order.refundStatus !== "NONE" && order.refundStatus !== "FAILED";
  const canReplace =
    order.returnType === "REPLACEMENT" &&
    order.returnStatus === "RECEIVED" &&
    !order.replacementOrderId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-8">
      <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
        Returns & Refunds
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Fact label="Return Status">{order.returnStatus || "NONE"}</Fact>
        <Fact label="Refund Status">{order.refundStatus || "NONE"}</Fact>
        <Fact label="Refund Method">{order.refundMethod || "-"}</Fact>
        <Fact label="Return Type">{order.returnType || "-"}</Fact>
      </div>

      {canWrite && (
        <div className="mt-4 sm:mt-6">
          {returnRequested ? (
            <div className="flex flex-wrap gap-2">
              {RETURN_STEPS.map((s) => (
                <button
                  key={s}
                  onClick={() => actions.updateReturn(s)}
                  disabled={actions.returnPending}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Set {s}
                </button>
              ))}
            </div>
          ) : (
            <Hint>No return has been requested for this order yet.</Hint>
          )}
        </div>
      )}

      {canWrite && (
        <div className="mt-3 sm:mt-4">
          {refundHandled ? (
            <Hint>
              A refund has already been {order.refundStatus.toLowerCase()} for this order.
            </Hint>
          ) : !refundEligible ? (
            <Hint>
              Refunds are only available for cancelled orders, or once a return has been approved.
            </Hint>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => actions.refund("WALLET")}
                disabled={actions.refundPending}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-black disabled:opacity-60"
              >
                Refund to Wallet
              </button>
              <button
                onClick={() => actions.refund("ORIGINAL")}
                disabled={actions.refundPending}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Refund to Original
              </button>
              {canReplace && (
                <button
                  onClick={actions.createReplacement}
                  disabled={actions.replacementPending}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  Create Replacement Order
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
