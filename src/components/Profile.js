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
} from "react-icons/fa";

const OrderCard = lazy(() => import("./OrderCard"));

const Toast = ({ kind = "success", message }) => {
  if (!message) return null;
  const ok = kind === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow-lg ring-1 ${
        ok ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-red-50 text-red-800 ring-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {ok ? <FaCheckCircle /> : <FaTimesCircle />}
        <span>{message}</span>
      </div>
    </div>
  );
};

const Skeleton = () => (
  <div className="mt-12 p-4 sm:p-8 max-w-6xl mx-auto">
    <div className="rounded-3xl bg-white/60 backdrop-blur ring-1 ring-gray-200 shadow-xl p-8">
      <div className="flex flex-col items-center">
        <div className="h-36 w-36 rounded-full bg-gray-200 animate-pulse" />
        <div className="mt-4 h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="mt-1 h-4 w-44 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const Profile = ({ setIsLoggedIn }) => {
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

  const showToast = (kind, message, ms = 1800) => {
    setToast({ kind, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ kind, message: "" }), ms);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [p, o] = await Promise.all([axios.get("/api/profile"), axios.get("/api/profile/orders")]);
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
  if (error) return <p className="text-center text-lg text-red-600 mt-10">{error}</p>;

  return (
    <>
      <Toast kind={toast.kind} message={toast.message} />

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="mt-12 p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 p-8 sm:p-10">
            <div className="mx-auto flex flex-col items-center">
              <div className="relative h-36 w-36 sm:h-40 sm:w-40">
                <img
                  src={
                    user?.profileImage ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  }
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover ring-4 ring-white shadow-xl"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg cursor-pointer transition hover:scale-105"
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

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
                {user?.name || "Guest"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{user?.username ? `@${user.username}` : ""}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>

              <div className="mt-6 flex gap-2 rounded-full bg-white ring-1 ring-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === "orders"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-8 mx-auto max-w-md">
                <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">Adjust & upload</p>
                  <div className="flex flex-col items-center">
                    <AvatarEditor
                      ref={editorRef}
                      image={selectedFile}
                      width={260}
                      height={260}
                      border={20}
                      borderRadius={150}
                      scale={scale}
                      className="rounded-lg"
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
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setScale(1.2);
                        }}
                        className="px-4 py-2 rounded-xl text-sm ring-1 ring-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpload}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 shadow"
                      >
                        <FaCloudUploadAlt /> Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "overview" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaUser />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaEnvelope />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900 break-all">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                        <FaPen />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="font-semibold text-gray-900">
                          {user?.username ? `@${user.username}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
                  >
                    <FaInfoCircle /> About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
                  >
                    <FaEnvelope /> Contact Us
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order History</h2>
                <Suspense fallback={<p className="text-center text-gray-600 py-8">Loading your orders…</p>}>
                  {orders.length === 0 ? (
                    <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-8 text-center">
                      <p className="text-gray-700">You haven’t placed any orders yet.</p>
                      <Link
                        to="/products"
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-white font-semibold shadow hover:opacity-95"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
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
};

export default Profile;
