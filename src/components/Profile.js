import React, { useEffect, useState } from "react";
import useProfileData from "./profile/useProfileData";
import useProfileToast from "./profile/useProfileToast";
import useLogout from "./profile/useLogout";
import useAvatarUpload from "./profile/useAvatarUpload";
import useTwoFactor from "./profile/useTwoFactor";
import ProfileToast from "./profile/ProfileToast";
import ProfileSkeleton from "./profile/ProfileSkeleton";
import ProfileHeader from "./profile/ProfileHeader";
import PersonalDetailsCard from "./profile/PersonalDetailsCard";
import SecurityCard from "./profile/SecurityCard";
import PasswordCard from "./profile/PasswordCard";
import QuickLinks from "./profile/QuickLinks";
import WalletCard from "./profile/WalletCard";
import AddressBook from "./profile/AddressBook";
import OrdersTab from "./profile/OrdersTab";
import AvatarCropModal from "./profile/AvatarCropModal";
import TwoFactorSetupModal from "./profile/TwoFactorSetupModal";
import { LogOutIcon } from "./ui/icons";

const TABS = ["overview", "orders"];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast, notify } = useProfileToast();
  const {
    user,
    orders,
    wallet,
    addresses,
    loading,
    failed,
    unauthorized,
    patchUser,
    setAddresses,
  } = useProfileData();
  const logout = useLogout();

  const avatar = useAvatarUpload({
    notify,
    onUploaded: patchUser,
    onUnauthorized: logout,
  });
  const twoFA = useTwoFactor({ patchUser, notify });

  useEffect(() => {
    if (unauthorized) logout();
  }, [unauthorized, logout]);

  if (loading) return <ProfileSkeleton />;
  // Only block on the error when there is nothing to show
  if (failed && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f3ed] font-medium text-[#75483b]">
        Failed to fetch profile or orders
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="premium-page premium-account min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-20">
      <ProfileToast kind={toast.kind} message={toast.message} />
      <TwoFactorSetupModal twoFA={twoFA} />

      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tint via-sand to-white opacity-70" />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-10">
        <ProfileHeader
          user={user}
          ordersCount={orders.length}
          onPickPhoto={avatar.pick}
          patchUser={patchUser}
          notify={notify}
        />

        <div className="mt-3.5 sm:mt-6 flex justify-center sm:justify-start mb-3 sm:mb-5">
          <div className="bg-white p-1 rounded-xl shadow-2xs border border-line inline-flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-ink text-white shadow-xs"
                    : "text-muted hover:text-ink hover:bg-sand"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5">
              <PersonalDetailsCard user={user} />
              <div className="lg:col-span-2 space-y-3.5 sm:space-y-5">
                <SecurityCard enabled={user.twoFactorEnabled} twoFA={twoFA} />
                <PasswordCard notify={notify} />
                <QuickLinks />
                <WalletCard wallet={wallet} />
                <AddressBook addresses={addresses} setAddresses={setAddresses} notify={notify} />
              </div>
            </div>
          ) : (
            <OrdersTab orders={orders} />
          )}
        </div>

        <div className="mt-8 pb-12 flex justify-center">
          <button
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-alert/30 bg-alert/10 hover:bg-alert/15 text-alert font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
          >
            <LogOutIcon className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <AvatarCropModal avatar={avatar} />
    </div>
  );
}
