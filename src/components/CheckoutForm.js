import React, { useState } from "react";
import { useSelector } from "react-redux";
import { LockIcon, ShieldCheckIcon } from "./ui/icons";
import CheckoutPreview from "./CheckoutPreview";
import useCheckoutForm from "./checkout/useCheckoutForm";
import usePayment from "./checkout/usePayment";
import OrderReviewModal from "./checkout/OrderReviewModal";
import SavedAddresses from "./checkout/SavedAddresses";
import WalletSection from "./checkout/WalletSection";
import ContactFields from "./checkout/ContactFields";
import DeliveryFields from "./checkout/DeliveryFields";
import PaymentSummary from "./checkout/PaymentSummary";
import MobilePayBar from "./checkout/MobilePayBar";

export default function CheckoutForm({ onOrderPlaced, totalAmount }) {
  const cartItems = useSelector((s) => s.cart);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [showReview, setShowReview] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [useWallet, setUseWallet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const form = useCheckoutForm({ totalAmount, isAuthenticated });
  const payment = usePayment({
    isAuthenticated,
    totalAmount,
    form,
    onOrderPlaced,
    useWallet,
    paymentMethod,
    saveAddress,
  });

  const total = Number(totalAmount) || 0;

  // Step 1: validate, then show the review overlay
  const onSubmit = (e) => {
    e.preventDefault();
    if (form.submit()) setShowReview(true);
  };

  if (!isAuthenticated) return <CheckoutPreview />;

  return (
    <>
      {showReview && (
        <OrderReviewModal
          cartItems={cartItems}
          data={form.data}
          total={total}
          walletApplied={payment.walletApplied}
          payable={payment.payable}
          busy={payment.busy}
          onEdit={() => setShowReview(false)}
          // Step 2: confirm and pay
          onConfirm={() => payment.placeOrder({ onStart: () => setShowReview(false) })}
        />
      )}

      <div className="premium-page premium-checkout relative w-full bg-[#f6f3ed] py-4 sm:py-10 overflow-hidden pb-28 lg:pb-10">
        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
          <div className="mb-4 sm:mb-6 rounded-xl bg-tint/80 border border-line-strong px-3 py-2 sm:p-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-ink-soft shadow-xs backdrop-blur-xs">
            <ShieldCheckIcon size={13} /> <span>TEST MODE — No real money will be charged.</span>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8"
          >
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 shadow-sm border border-black/[0.06]">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-black/[0.06] pb-3.5 sm:pb-5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner shrink-0">
                    <LockIcon size={15} />
                  </div>
                  <div>
                    <h2 className="font-editorial text-lg sm:text-2xl font-bold text-[#1d1c19] leading-tight">
                      Secure checkout.
                    </h2>
                    <p className="text-xs sm:text-sm text-[#777269] mt-0.5 font-medium">
                      Where should we send your order?
                    </p>
                  </div>
                </div>

                <SavedAddresses
                  addresses={form.addresses}
                  selectedId={form.selectedAddressId}
                  onSelect={form.selectAddress}
                />
                <WalletSection
                  balance={payment.walletBalance}
                  total={total}
                  useWallet={useWallet}
                  onToggle={setUseWallet}
                  onTopUp={payment.topUpWallet}
                />
                <ContactFields field={form.field} />
                <DeliveryFields field={form.field} />

                <div className="mt-4 flex items-center gap-2">
                  <input
                    id="save-address"
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-line-strong text-accent focus:ring-accent"
                  />
                  <label htmlFor="save-address" className="text-xs font-bold text-muted">
                    Save this address for next time
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <PaymentSummary
                total={total}
                payable={payment.payable}
                paymentMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                busy={payment.busy}
                ready={payment.rzpReady}
                status={payment.status}
              />
            </div>

            <MobilePayBar
              total={total}
              payable={payment.payable}
              busy={payment.busy}
              ready={payment.rzpReady}
            />
          </form>
        </div>
      </div>
    </>
  );
}
