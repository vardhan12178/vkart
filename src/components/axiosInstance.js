import axios from "axios";

const ENV_URL =
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : "") ||
  process.env.REACT_APP_API_URL ||
  "";

const isDev = process.env.NODE_ENV === "development";

// Dev: empty baseURL so "/api/*" hits CRA proxy (same-origin cookies)
// Prod: use REACT_APP_API_URL (or VITE_API_BASE_URL) if set
const baseURL = ENV_URL ? ENV_URL.replace(/\/+$/, "") : (isDev ? "" : "");

const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 25000,
  validateStatus: (s) => s >= 200 && s < 300,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

instance.interceptors.request.use((config) => {
  const isForm = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isForm) {
    if (config.headers && config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
  } else {
    const method = (config.method || "get").toLowerCase();
    if (!["get", "head"].includes(method)) {
      config.headers = { ...(config.headers || {}), "Content-Type": "application/json" };
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
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
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
