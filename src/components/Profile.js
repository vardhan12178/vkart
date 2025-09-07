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
} from "react-icons/fa";

const OrderCard = lazy(() => import("./OrderCard"));

/**
 * MOBILE NOTES
 * - Smaller paddings and sizes on <640px
 * - Sticky tab bar on mobile so switching Overview/Orders is easy
 * - Toast sits at the bottom on mobile, at the top on larger screens
 * - Background blurs are hidden on mobile to improve performance
 * - Avatar editor modal is full-height on mobile with internal scroll
 */

const Toast = ({ kind = "success", message }) => {
  if (!message) return null;
  const ok = kind === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed sm:top-5 top-auto bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-lg ring-1 ${
        ok
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-red-50 text-red-800 ring-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {ok ? <FaCheckCircle /> : <FaTimesCircle />}
        <span className="max-w-[75vw] truncate sm:max-w-none sm:truncate-0">{message}</span>
      </div>
    </div>
  );
};

const Skeleton = () => (
  <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
    <div className="rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-xl overflow-hidden">
      <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 p-6 sm:p-10">
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

export default function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ kind: "success", message: "" });
  const toastTimer = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1.2);
  const [showEditor, setShowEditor] = useState(false);

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
        setUser(p.data);
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
      setUser(res.data);
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

  if (loading) return <Skeleton />;
  if (error)
    return (
      <p className="text-center text-base sm:text-lg text-red-600 mt-8 sm:mt-10">{error}</p>
    );

  const ordersCount = orders.length;

  return (
    <>
      <Toast kind={toast.kind} message={toast.message} />

      {/* PERF: Hide heavy blurs on mobile */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden sm:block">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-xl overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50" />
            <div className="relative p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 shrink-0">
                    <img
                      src={
                        user?.profileImage ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      }
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover ring-2 sm:ring-4 ring-white shadow-xl"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                      }}
                    />
                    <label
                      htmlFor="file-upload"
                      className="absolute bottom-1.5 right-1.5 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg cursor-pointer transition active:scale-95 hover:scale-105"
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
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 truncate">
                        {user?.name || "Guest"}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        <FaCheckCircle /> Member
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm text-gray-600 break-all">
                      {user?.username ? `@${user.username}` : ""}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 ring-1 ring-gray-200 max-w-full">
                      <FaEnvelope className="text-orange-600 shrink-0" />
                      <span className="break-all">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-xl sm:rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm w-full sm:w-auto">
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 text-center">
                    <div className="text-[11px] sm:text-xs text-gray-500">Orders</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">{ordersCount}</div>
                  </div>
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 text-center">
                    <div className="text-[11px] sm:text-xs text-gray-500">Wishlist</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">—</div>
                  </div>
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 text-center">
                    <div className="text-[11px] sm:text-xs text-gray-500">Coupons</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">—</div>
                  </div>
                </div>
              </div>

              {/* Sticky tab bar on mobile */}
              <div className="mt-4 sm:mt-6 sticky top-[env(safe-area-inset-top)] z-10">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 rounded-full bg-white p-1 ring-1 ring-gray-200 w-full md:w-max shadow sm:shadow-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition ${
                      activeTab === "overview"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition ${
                      activeTab === "orders"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Orders
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === "overview" ? (
              <>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaUser />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaEnvelope />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900 break-all">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaPen />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs text-gray-500">Username</p>
                        <p className="font-semibold text-gray-900 truncate">
                          {user?.username ? `@${user.username}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
                  <Link
                    to="/products"
                    className="group rounded-2xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaBoxOpen />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Browse Products</p>
                        <p className="text-[11px] sm:text-xs text-gray-500">Shop the latest arrivals</p>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/about"
                    className="group rounded-2xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaInfoCircle />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">About Us</p>
                        <p className="text-[11px] sm:text-xs text-gray-500">Know more about VKart</p>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/contact"
                    className="group rounded-2xl ring-1 ring-gray-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaEnvelope />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Contact Support</p>
                        <p className="text-[11px] sm:text-xs text-gray-500">We’re here to help</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 sm:px-6 py-2.5 sm:py-3 text-white text-sm sm:text-base font-semibold shadow hover:opacity-95 w-full sm:w-auto"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Order History</h2>
                  <div className="rounded-full bg-orange-50 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-orange-700 ring-1 ring-orange-100">
                    {ordersCount} orders
                  </div>
                </div>
                <Suspense fallback={<p className="text-center text-gray-600 py-6 sm:py-8">Loading your orders…</p>}>
                  {orders.length === 0 ? (
                    <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6 sm:p-8 text-center">
                      <p className="text-gray-700">You haven’t placed any orders yet.</p>
                      <Link
                        to="/products"
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 sm:px-5 py-2.5 text-white font-semibold shadow hover:opacity-95"
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

      {showEditor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowEditor(false);
              setSelectedFile(null);
            }}
          />
          {/* Modal: full-height on mobile with internal scroll */}
          <div className="relative z-10 mx-3 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-5">
              <p className="mb-3 text-sm font-medium text-gray-700">Adjust & upload</p>
              <div className="flex flex-col items-center">
                <AvatarEditor
                  ref={editorRef}
                  image={selectedFile}
                  width={240}
                  height={240}
                  border={16}
                  borderRadius={140}
                  scale={scale}
                  className="rounded-lg max-w-full"
                />
                <input
                  min={1}
                  max={2.5}
                  step={0.05}
                  type="range"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-3 w-full"
                  aria-label="Zoom profile photo"
                />
                <div className="mt-4 flex w-full flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditor(false);
                      setSelectedFile(null);
                      setScale(1.2);
                    }}
                    className="px-4 py-2 rounded-xl text-sm ring-1 ring-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 shadow w-full sm:w-auto"
                  >
                    <FaCloudUploadAlt /> Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
