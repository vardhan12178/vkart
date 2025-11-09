import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import axios from "./axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import AvatarEditor from "react-avatar-editor";
import imageCompression from "browser-image-compression";
import {
  FaCamera,
  FaPen,
  FaEnvelope,
  FaInfoCircle,
  FaSignOutAlt,
  FaCloudUploadAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaShieldAlt,
  FaLock,
  FaQrcode,
  FaKey,
} from "react-icons/fa";

const OrderCard = lazy(() => import("./OrderCard"));

const Skeleton = () => (
  <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
    <div className="rounded-3xl bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-2xl overflow-hidden">
      <div className="relative bg-gradient-to-r from-orange-100 to-amber-100 p-6 sm:p-10">
        <div className="mx-auto flex flex-col items-center">
          <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-gray-200 animate-pulse" />
          <div className="mt-4 h-5 sm:h-6 w-40 sm:w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-28 sm:w-32 bg-gray-200 rounded animate-pulse" />
          <div className="mt-1 h-4 w-44 sm:w-56 bg-gray-200 rounded animate-pulse" />
          <div className="mt-6 h-9 sm:h-10 w-56 sm:w-64 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Toast = ({ kind = "success", message }) => {
  if (!message) return null;
  const ok = kind === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed sm:top-5 top-auto bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-xl ${
        ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2">
        {ok ? <FaCheckCircle /> : <FaTimesCircle />}
        <span className="max-w-[75vw] truncate sm:max-w-none sm:truncate-0">{message}</span>
      </div>
    </div>
  );
};

export default function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");

  const [toast, setToast] = useState({ kind: "success", message: "" });
  const toastTimer = useRef(null);

  // Avatar
  const [selectedFile, setSelectedFile] = useState(null);
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1.2);
  const [showEditor, setShowEditor] = useState(false);

  // 2FA
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFAState, setTwoFAState] = useState({
    qr: "",
    secret: "",
    code: "",
    loading: false,
    disabling: false,
  });

  const showToast = (kind, message, ms = 1800) => {
    setToast({ kind, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ kind, message: "" }), ms);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [p, o] = await Promise.all([
          axios.get("/api/profile"),
          axios.get("/api/profile/orders"),
        ]);

        // ✅ force booleans so UI doesn't flicker
        const profile = {
          ...p.data,
          twoFactorEnabled: !!p.data.twoFactorEnabled,
          suppress2faPrompt: !!p.data.suppress2faPrompt,
        };

        setUser(profile);
        setOrders((o.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        if (e?.response?.status === 401) {
          setIsLoggedIn?.(false);
          navigate("/login");
          return;
        }
        setError("Failed to fetch profile or orders");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [navigate, setIsLoggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
    } catch {}
    setIsLoggedIn?.(false);
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const okType = /^image\/(png|jpe?g|webp)$/i.test(f.type);
    if (!okType || f.size > 8 * 1024 * 1024) {
      showToast("error", "Use PNG/JPG/WEBP under 8MB.");
      return;
    }
    setSelectedFile(f);
    setShowEditor(true);
  };

  const handleUpload = async () => {
    if (!editorRef.current || !selectedFile) return;
    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) return;
      const compressed = await imageCompression(blob, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("profileImage", compressed, `profile-${Date.now()}.jpg`);
      const res = await axios.post("/api/profile/upload", formData);

      // ✅ merge so we don't lose twoFactorEnabled etc.
      setUser((prev) => ({ ...(prev || {}), ...res.data }));

      setSelectedFile(null);
      setScale(1.2);
      setShowEditor(false);
      showToast("success", "Profile photo updated!", 1600);
    } catch (e) {
      if (e?.response?.status === 401) {
        setIsLoggedIn?.(false);
        navigate("/login");
        return;
      }
      const msg = e?.response?.data?.message || "Failed to upload profile image.";
      showToast("error", msg, 2200);
    }
  };

  const startTwoFASetup = async () => {
    try {
      setTwoFAState((s) => ({ ...s, loading: true, code: "" }));
      const res = await axios.post("/api/2fa/setup");
      setTwoFAState((s) => ({
        ...s,
        loading: false,
        qr: res.data?.qr || "",
        secret: res.data?.manualEntryKey || "",
      }));
      setTwoFAOpen(true);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to start 2FA setup.";
      showToast("error", msg);
      setTwoFAState((s) => ({ ...s, loading: false }));
    }
  };

  const confirmTwoFAEnable = async () => {
    const code = String(twoFAState.code || "").trim();
    if (!/^\d{6}$/.test(code)) {
      showToast("error", "Enter a valid 6-digit code.");
      return;
    }
    try {
      setTwoFAState((s) => ({ ...s, loading: true }));
      await axios.post("/api/2fa/enable", { token: code, secret: twoFAState.secret });
      setUser((u) => ({ ...u, twoFactorEnabled: true }));
      setTwoFAOpen(false);
      setTwoFAState({ qr: "", secret: "", code: "", loading: false, disabling: false });
      showToast("success", "Two-factor authentication enabled.");
    } catch (e) {
      const msg = e?.response?.data?.message || "Invalid code. Try again.";
      showToast("error", msg);
      setTwoFAState((s) => ({ ...s, loading: false }));
    }
  };

  const disableTwoFA = async () => {
    try {
      setTwoFAState((s) => ({ ...s, disabling: true }));
      await axios.post("/api/2fa/disable");
      setUser((u) => ({ ...u, twoFactorEnabled: false }));
      showToast("success", "Two-factor authentication disabled.");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to disable 2FA.";
      showToast("error", msg);
    } finally {
      setTwoFAState((s) => ({ ...s, disabling: false }));
    }
  };

  if (loading) return <Skeleton />;
  if (error) return <p className="text-center text-base sm:text-lg text-red-600 mt-8 sm:mt-10">{error}</p>;

  const ordersCount = orders.length;

return (
  <>
    <Toast kind={toast.kind} message={toast.message} />

    <div className="min-h-screen bg-[#f9fafb] py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0">
                <img
                  src={
                    user?.profileImage ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  }
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover ring-4 ring-white shadow-md"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png")
                  }
                />
                <label
                  htmlFor="file-upload"
                  className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-white shadow-md cursor-pointer hover:bg-orange-600 transition"
                  title="Change photo"
                >
                  <FaCamera />
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name || "Guest"}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <FaCheckCircle /> Member
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 truncate">{user?.username ? `@${user.username}` : ""}</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700 border border-gray-200 max-w-full overflow-hidden">
                  <FaEnvelope className="text-orange-500 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Stats + Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center md:flex-col md:items-end gap-3 w-full md:w-auto">
              <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl bg-gray-50 shadow-sm w-full sm:w-auto text-center">
                <div className="px-4 py-2 sm:py-3">
                  <div className="text-xs text-gray-500">Orders</div>
                  <div className="text-lg font-semibold text-gray-900">{ordersCount}</div>
                </div>
                <div className="px-4 py-2 sm:py-3">
                  <div className="text-xs text-gray-500">Wishlist</div>
                  <div className="text-lg font-semibold text-gray-900">—</div>
                </div>
                <div className="px-4 py-2 sm:py-3">
                  <div className="text-xs text-gray-500">Coupons</div>
                  <div className="text-lg font-semibold text-gray-900">—</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500 text-orange-600 px-5 py-2.5 text-sm font-semibold hover:bg-orange-50 transition w-full sm:w-auto"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-orange-500 text-white shadow"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "orders"
                  ? "bg-orange-500 text-white shadow"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        {/* Panels */}
        <div className="p-5 sm:p-8 bg-white">
          {activeTab === "overview" ? (
            <>
              {/* Identity */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                {[
                  { icon: <FaUser />, label: "Name", value: user?.name },
                  { icon: <FaEnvelope />, label: "Email", value: user?.email },
                  {
                    icon: <FaPen />,
                    label: "Username",
                    value: user?.username ? `@${user.username}` : "—",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-medium text-gray-900 truncate break-all">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security */}
              <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Security</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Protect your account with two-factor authentication.
                      </p>
                    </div>
                  </div>

                  {user?.twoFactorEnabled ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <FaCheckCircle /> Enabled
                      </span>
                      <button
                        onClick={disableTwoFA}
                        disabled={twoFAState.disabling}
                        className="border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <FaLock /> {twoFAState.disabling ? "Disabling…" : "Disable 2FA"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startTwoFASetup}
                      disabled={twoFAState.loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600 disabled:opacity-70"
                    >
                      <FaQrcode /> {twoFAState.loading ? "Preparing…" : "Enable 2FA"}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-3">
                <Link
                  to="/products"
                  className="group rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <FaBoxOpen />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Browse Products</p>
                      <p className="text-xs text-gray-500">Shop the latest arrivals</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/about"
                  className="group rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <FaInfoCircle />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">About Us</p>
                      <p className="text-xs text-gray-500">Know more about VKart</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/contact"
                  className="group rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Contact Support</p>
                      <p className="text-xs text-gray-500">We’re here to help</p>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Orders */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order History</h2>
                <div className="rounded-full bg-orange-50 px-3 py-1 text-xs sm:text-sm font-semibold text-orange-700">
                  {ordersCount} orders
                </div>
              </div>

              <Suspense fallback={<p className="text-center text-gray-500 py-8">Loading your orders…</p>}>
                {orders.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 text-center shadow-sm">
                    <p className="text-gray-600">You haven’t placed any orders yet.</p>
                    <Link
                      to="/products"
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-5 py-2.5 font-semibold shadow hover:bg-orange-600 transition"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {orders.map((o) => (
                      <OrderCard key={o._id} order={o} />
                    ))}
                  </div>
                )}
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  </>
);


}
