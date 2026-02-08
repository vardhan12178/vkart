import axios from "axios";

// Auto-detect: use localhost backend when running locally, production URL otherwise
const isLocalhost = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const baseURL = isLocalhost
  ? "http://localhost:5000"
  : (process.env.REACT_APP_API_BASE_URL || "");

console.log("DEBUG: Axios Base URL is:", baseURL, isLocalhost ? "(local dev)" : "(production)");

const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 25000,
  validateStatus: (s) => s >= 200 && s < 300,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

instance.interceptors.request.use((config) => {
  // Cookies are sent automatically via withCredentials: true
  // No need to manually add Authorization header

  const isForm = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isForm) {
    if (config.headers?.["Content-Type"]) delete config.headers["Content-Type"];
  } else {
    const m = (config.method || "get").toLowerCase();
    if (!["get", "head"].includes(m)) {
      const csrf = getCookie("csrf_token");
      config.headers = {
        ...(config.headers || {}),
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      };
    }
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error?.config || {};
    const status = error?.response?.status;

    if (status === 401) {
      // Don't redirect for auth-check calls (profile, admin verify, etc.) - these should fail silently
      const isAuthCheck = cfg.url?.includes('/api/profile') ||
        cfg.url?.includes('/api/auth/check') ||
        cfg.url?.includes('/api/admin/verify') ||
        cfg.__skipAuthRedirect;

      if (!isAuthCheck && typeof window !== "undefined") {
        const path = window.location.pathname;
        // Don't redirect if already on a login page
        if (!path.startsWith("/login") && !path.startsWith("/admin/login")) {
          // Redirect admin routes to admin login, regular routes to regular login
          if (path.startsWith("/admin")) {
            window.location.assign("/admin/login");
          } else {
            window.location.assign("/login");
          }
        }
      }
      return Promise.reject(error);
    }

    const retriable =
      !error.response ||
      [502, 503, 504].includes(status) ||
      error.code === "ECONNABORTED" ||
      (typeof error.message === "string" && error.message.includes("Network Error"));

    if (retriable && !cfg.__retried) {
      cfg.__retried = true;
      await new Promise((r) => setTimeout(r, 1200));
      return instance(cfg);
    }
    return Promise.reject(error);
  }
);

export default instance;
