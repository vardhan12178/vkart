import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import axios from "./axiosInstance"; // Kept as requested
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { clearCart } from "../redux/cartSlice";
import { clearWishlist } from "../redux/wishlistSlice";
import imageCompression from "browser-image-compression";
// Removed ProfilePreview import if it's not strictly needed, or keep if you have it. 
// Assuming ProfilePreview was just a placeholder in your previous code.
import AvatarEditor from "react-avatar-editor";

import {
  FaCamera,
  FaPen,
  FaEnvelope,
  FaInfoCircle,
  FaSignOutAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaShieldAlt,
  FaLock,
  FaQrcode,
  FaChevronRight,
  FaShoppingBag,
  FaTimes,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaCrown
} from "react-icons/fa";

const OrderCard = lazy(() => import("./OrderCard"));

// --- HELPER: Get Initials ---
const getInitials = (name) => {
  if (!name) return "VK";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// --- MODERN SKELETON LOADER ---
const Skeleton = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-8 animate-pulse">
        <div className="h-32 w-32 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-32 bg-gray-200 rounded-lg" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white rounded-3xl shadow-sm border border-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// --- PREMIUM TOAST ---
const Toast = ({ kind = "success", message }) => {
  if (!message) return null;
  const ok = kind === "success";
  return (
    <div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 animate-fade-in-down">
      <div className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border ${ok ? "bg-emerald-50/90 border-emerald-100 text-emerald-800" : "bg-red-50/90 border-red-100 text-red-800"
        }`}>
        <div className={`p-1 rounded-full ${ok ? 'bg-emerald-200' : 'bg-red-200'}`}>
          {ok ? <FaCheckCircle size={14} /> : <FaTimesCircle size={14} />}
        </div>
        <span className="text-sm font-semibold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- STATE (UNCHANGED LOGIC) ---
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
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });

  // Password change
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "", loading: false });

  // Address book
  const [addresses, setAddresses] = useState([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [editAddr, setEditAddr] = useState(null); // null = add mode, object = edit mode
  const emptyAddr = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", isDefault: false };
  const [addrForm, setAddrForm] = useState({ ...emptyAddr });
  const [addrLoading, setAddrLoading] = useState(false);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const showToast = (kind, message, ms = 1800) => {
    setToast({ kind, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ kind, message: "" }), ms);
  };

  // --- EFFECTS (Cookie-based auth) ---
  useEffect(() => {
    // No localStorage check needed - let API call verify auth via cookie

    const load = async () => {
      try {
        setLoading(true);
        // Note: In a real app, ensure axios interceptors handle auth headers or pass them here
        const [p, o] = await Promise.all([
          axios.get("/api/profile"),
          axios.get("/api/profile/orders"),
        ]);

        const profile = {
          ...p.data,
          twoFactorEnabled: !!p.data.twoFactorEnabled,
          suppress2faPrompt: !!p.data.suppress2faPrompt,
        };

        setUser(profile);
        setOrders(
          (o.data || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );

        try {
          const w = await axios.get("/api/wallet");
          setWallet({
            balance: Number(w?.data?.balance) || 0,
            transactions: w?.data?.transactions || [],
          });
        } catch {}

        try {
          const a = await axios.get("/api/profile/addresses");
          setAddresses(a.data?.addresses || []);
        } catch {}
      } catch (e) {
        // If 401, logout
        if (e.response && e.response.status === 401) {
          handleLogout();
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
  }, [navigate]);

  // --- HANDLERS (UNCHANGED LOGIC) ---
  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_token");
      dispatch(clearCart());
      dispatch(clearWishlist());
      dispatch(logout());
      navigate("/");
    }
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

      setUser((prev) => ({ ...(prev || {}), ...res.data }));

      setSelectedFile(null);
      setScale(1.2);
      setShowEditor(false);
      showToast("success", "Profile photo updated!", 1600);
    } catch (e) {
      if (e?.response?.status === 401) {
        dispatch(logout());
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

  const handleChangePassword = async () => {
    const { current, next, confirm } = pw;
    if (!current || !next || !confirm) return showToast("error", "All fields are required.");
    if (next.length < 8) return showToast("error", "New password must be at least 8 characters.");
    if (next !== confirm) return showToast("error", "New passwords do not match.");
    try {
      setPw((s) => ({ ...s, loading: true }));
      await axios.put("/api/profile/password", {
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      showToast("success", "Password changed successfully!");
      setPw({ current: "", next: "", confirm: "", loading: false });
      setPwOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to change password.";
      showToast("error", msg);
      setPw((s) => ({ ...s, loading: false }));
    }
  };

  // --- ADDRESS HANDLERS ---
  const openAddressForm = (addr = null) => {
    if (addr) {
      setEditAddr(addr);
      setAddrForm({ fullName: addr.fullName || "", phone: addr.phone || "", line1: addr.line1 || "", line2: addr.line2 || "", city: addr.city || "", state: addr.state || "", zip: addr.zip || "", isDefault: !!addr.isDefault });
    } else {
      setEditAddr(null);
      setAddrForm({ ...emptyAddr });
    }
    setAddrOpen(true);
  };

  const handleSaveAddress = async () => {
    const { fullName, phone, line1, city, state, zip } = addrForm;
    if (!fullName || !phone || !line1 || !city || !state || !zip) return showToast("error", "Please fill all required fields.");
    try {
      setAddrLoading(true);
      let res;
      if (editAddr) {
        res = await axios.put(`/api/profile/addresses/${editAddr._id}`, addrForm);
      } else {
        res = await axios.post("/api/profile/addresses", addrForm);
      }
      setAddresses(res.data.addresses || []);
      setAddrOpen(false);
      setEditAddr(null);
      setAddrForm({ ...emptyAddr });
      showToast("success", editAddr ? "Address updated!" : "Address added!");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to save address.");
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await axios.delete(`/api/profile/addresses/${addrId}`);
      setAddresses(res.data.addresses || []);
      showToast("success", "Address removed.");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleUpdateName = async () => {
    if (!nameInput.trim()) return;
    try {
      const res = await axios.put("/api/profile/name", { name: nameInput.trim() });
      setUser((u) => ({ ...u, name: res.data.name }));
      setEditingName(false);
      showToast("success", "Name updated!");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to update name.");
    }
  };

  if (loading) return <Skeleton />;
  // Only show error if truly blocking (e.g. network fail), otherwise show partial
  if (error && !user) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium bg-gray-50">{error}</div>;
  // If somehow loaded but no user
  if (!user && !loading) return null;

  const ordersCount = orders.length;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 pb-20">
      <Toast kind={toast.kind} message={toast.message} />

      {/* --- 2FA MODAL --- */}
      {twoFAOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Setup 2FA</h3>
              <button onClick={() => setTwoFAOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              {twoFAState.qr ? (
                <img src={twoFAState.qr} alt="QR" className="w-40 h-40 mb-4 rounded-lg border border-gray-200" />
              ) : (
                <div className="w-40 h-40 mb-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No QR Loaded</div>
              )}
              <p className="text-xs text-gray-500 mb-4">Scan this with Google Authenticator</p>

              <div className="w-full bg-gray-50 p-2 rounded-lg mb-6 border border-gray-100 flex items-center justify-between">
                <code className="text-xs font-mono text-gray-600 truncate flex-1 text-left">{twoFAState.secret}</code>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full text-center text-xl tracking-widest font-bold py-3 border-b-2 border-gray-200 focus:border-orange-500 outline-none bg-transparent mb-6"
                maxLength={6}
                value={twoFAState.code}
                onChange={(e) => setTwoFAState({ ...twoFAState, code: e.target.value.replace(/\D/g, "") })}
              />

              <button
                onClick={confirmTwoFAEnable}
                disabled={twoFAState.loading || twoFAState.code.length !== 6}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
              >
                {twoFAState.loading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BACKGROUND DECOR --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-gray-50 to-white opacity-70" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16">

        {/* --- HEADER CARD --- */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          {/* Decorative Gradient Blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 z-10">

            {/* Avatar Group */}
            <div className="relative group shrink-0">
              <div className="h-36 w-36 sm:h-40 sm:w-40 rounded-full p-1.5 bg-white shadow-xl ring-1 ring-gray-100 overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    // Fallback to Initials if image load fails logic could be complex here, usually simpler to assume URL works or null
                    onError={(e) => {
                      // Optional: Hide img and show text fallback if broken
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  // --- INITIALS AVATAR (The solution) ---
                  <div className="h-full w-full rounded-full bg-gradient-to-tr from-orange-100 to-amber-200 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black text-orange-600/80 tracking-wide select-none">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}
              </div>

              <label htmlFor="file-upload" className="absolute bottom-2 right-2 p-3 bg-gray-900 text-white rounded-full cursor-pointer shadow-lg hover:bg-orange-600 hover:scale-110 transition-all duration-300 border-4 border-white z-10">
                <FaCamera size={14} />
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Text Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                      className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight bg-transparent border-b-2 border-orange-400 focus:outline-none px-1"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="p-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black"><FaCheckCircle /></button>
                    <button onClick={() => setEditingName(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600"><FaTimes /></button>
                  </div>
                ) : (
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight group/name cursor-pointer" onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }}>
                    {user?.name || "Guest User"}
                    <FaPen className="inline ml-2 text-sm text-gray-300 group-hover/name:text-orange-500 transition-colors" />
                  </h1>
                )}
                {user?.isPrime ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200 shadow-sm">
                    <FaCrown size={10} className="text-amber-500" />
                    Prime Member
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider border border-orange-100">
                    Member
                  </span>
                )}
              </div>

              <div className="text-gray-500 font-medium mb-6 flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="text-gray-400">@</span>{user?.username || "unknown"}
                </span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5">
                  <FaEnvelope className="text-gray-400" /> {user?.email}
                </span>
              </div>

              {/* Mini Stats */}
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="px-5 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500"><FaShoppingBag /></div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="font-bold text-gray-900 text-lg">{ordersCount}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            >
              <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="mt-10 flex justify-center md:justify-start mb-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex">
            {['overview', 'orders'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="animate-fade-in">
          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Column 1: Identity Cards */}
              <div className="space-y-4">
                {[
                  { icon: <FaUser />, label: "Full Name", value: user?.name },
                  { icon: <FaEnvelope />, label: "Email", value: user?.email },
                  { icon: <FaPen />, label: "Username", value: user?.username ? `@${user.username}` : "Not set" },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="font-bold text-gray-900 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Security (Span 2 cols on large screens) */}
              <div className="lg:col-span-2 space-y-6">

                {/* Security Box */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${user?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex gap-5">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${user?.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        <FaShieldAlt />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          Security
                          {user?.twoFactorEnabled && <FaCheckCircle className="text-emerald-500 text-sm" />}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Protect your account with 2FA.</p>
                      </div>
                    </div>

                    {user?.twoFactorEnabled ? (
                      <button
                        onClick={disableTwoFA}
                        disabled={twoFAState.disabling}
                        className="px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold hover:border-red-100 hover:bg-red-50 hover:text-red-600 transition-all text-sm flex items-center gap-2"
                      >
                        <FaLock size={12} /> {twoFAState.disabling ? "Disabling..." : "Disable"}
                      </button>
                    ) : (
                      <button
                        onClick={startTwoFASetup}
                        disabled={twoFAState.loading}
                        className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black hover:scale-105 transition-all text-sm flex items-center gap-2"
                      >
                        <FaQrcode size={14} /> {twoFAState.loading ? "Loading..." : "Setup 2FA"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Change Box */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${pwOpen ? 'bg-orange-400' : 'bg-gray-200'}`} />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex gap-5">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${pwOpen ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                        <FaLock />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Password</h3>
                        <p className="text-gray-500 text-sm mt-1">Update your account password.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPwOpen((o) => !o); setPw({ current: "", next: "", confirm: "", loading: false }); }}
                      className="px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold hover:border-orange-100 hover:bg-orange-50 hover:text-orange-600 transition-all text-sm flex items-center gap-2"
                    >
                      <FaPen size={12} /> {pwOpen ? "Cancel" : "Change"}
                    </button>
                  </div>

                  {pwOpen && (
                    <div className="mt-6 space-y-4 max-w-sm">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
                        <input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                        <input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all" placeholder="Min 8 characters" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                        <input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all" placeholder="Re-enter new password" />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={pw.loading}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50 text-sm"
                      >
                        {pw.loading ? "Saving..." : "Update Password"}
                      </button>
                    </div>
                  )}
                </div>

              {/* Quick Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { to: "/products", icon: <FaBoxOpen />, title: "Shop", desc: "Browse items", color: "text-orange-500", bg: "bg-orange-50" },
                    { to: "/about", icon: <FaInfoCircle />, title: "About", desc: "Our story", color: "text-blue-500", bg: "bg-blue-50" },
                    { to: "/contact", icon: <FaEnvelope />, title: "Support", desc: "Get help", color: "text-purple-500", bg: "bg-purple-50" },
                  ].map((link, i) => (
                    <Link key={i} to={link.to} className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${link.bg} ${link.color} text-lg`}>{link.icon}</div>
                        <FaChevronRight className="text-gray-300 group-hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100" size={12} />
                      </div>
                      <h4 className="font-bold text-gray-900">{link.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
                    </Link>
                  ))}
              </div>

              {/* Wallet */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">VKart Wallet</h3>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500">Available Balance</div>
                  <div className="text-2xl font-black text-gray-900">₹{Math.round(wallet.balance)}</div>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Recent Transactions
                </div>
                <div className="space-y-2">
                  {wallet.transactions.length === 0 ? (
                    <div className="text-sm text-gray-500">No wallet activity yet.</div>
                  ) : (
                    wallet.transactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.reason || t.type}</span>
                        <span className={`font-bold ${t.type === "CREDIT" ? "text-emerald-600" : "text-red-600"}`}>
                          {t.type === "CREDIT" ? "+" : "-"}₹{Math.round(t.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Address Book */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-500" /> Addresses
                  </h3>
                  <button onClick={() => openAddressForm()} className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    <FaPlus size={12} /> Add
                  </button>
                </div>

                {addresses.length === 0 && !addrOpen ? (
                  <div className="text-center py-8">
                    <FaMapMarkerAlt className="mx-auto text-gray-300 mb-3" size={28} />
                    <p className="text-sm text-gray-500">No saved addresses yet.</p>
                    <button onClick={() => openAddressForm()} className="mt-3 text-sm font-bold text-orange-600 hover:underline">Add your first address</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`p-4 rounded-xl border ${addr.isDefault ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100'} flex justify-between items-start gap-3`}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                            {addr.isDefault && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-xs text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openAddressForm(addr)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><FaPen size={12} /></button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><FaTrash size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Form (inline) */}
                {addrOpen && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-900 text-sm">{editAddr ? "Edit Address" : "New Address"}</h4>
                      <button onClick={() => { setAddrOpen(false); setEditAddr(null); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={14} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "fullName", label: "Full Name", span: 1 },
                        { key: "phone", label: "Phone", span: 1 },
                        { key: "line1", label: "Address Line 1", span: 2 },
                        { key: "line2", label: "Address Line 2 (optional)", span: 2 },
                        { key: "city", label: "City", span: 1 },
                        { key: "state", label: "State", span: 1 },
                        { key: "zip", label: "ZIP Code", span: 1 },
                      ].map((f) => (
                        <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{f.label}</label>
                          <input
                            type="text"
                            value={addrForm[f.key]}
                            onChange={(e) => setAddrForm((s) => ({ ...s, [f.key]: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm((s) => ({ ...s, isDefault: e.target.checked }))} className="rounded border-gray-300 text-orange-500 focus:ring-orange-200" />
                      Set as default address
                    </label>
                    <button onClick={handleSaveAddress} disabled={addrLoading} className="mt-4 w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:bg-black transition-all disabled:opacity-50">
                      {addrLoading ? "Saving..." : (editAddr ? "Update Address" : "Save Address")}
                    </button>
                  </div>
                )}
              </div>

            </div>
            </div>
          ) : (
            // --- ORDERS TAB ---
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[400px] p-8">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                  <p className="text-gray-500 text-sm">Track your recent purchases</p>
                </div>
                <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold">{ordersCount} Total</span>
              </div>

              <Suspense fallback={<div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}</div>}>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 text-3xl"><FaBoxOpen /></div>
                    <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Start shopping to fill this page.</p>
                    <Link
                      to="/products"
                      className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map(o => <OrderCard key={o._id} order={o} />)}
                  </div>
                )}
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* --- AVATAR CROPPER MODAL --- */}
      {showEditor && selectedFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-6 w-[320px]">
            <h3 className="text-lg font-bold text-center text-gray-900">Adjust Photo</h3>

            <div className="flex justify-center">
              <AvatarEditor
                ref={editorRef}
                image={selectedFile}
                width={200}
                height={200}
                border={20}
                borderRadius={120}
                scale={scale}
                rotate={0}
                className="rounded-full bg-gray-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider text-center">Zoom</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEditor(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-md hover:bg-black transition-transform active:scale-95"
              >
                Save Photo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
