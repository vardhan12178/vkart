import axios from "axios";

const isLocalhost = typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const baseURL = isLocalhost
  ? "http://localhost:5000"
  : "";

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
  const isForm = typeof FormData !== "undefined" && config.data instanceof FormData;
  const m = (config.method || "get").toLowerCase();
  const csrf = !["get", "head"].includes(m) ? getCookie("csrf_token") : "";
  if (isForm) {
    if (config.headers?.["Content-Type"]) delete config.headers["Content-Type"];
    config.headers = {
      ...(config.headers || {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    };
  } else {
    if (!["get", "head"].includes(m)) {
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
