import axios from "axios";

const ENV_URL =
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : "") ||
  process.env.REACT_APP_API_URL ||
  "";

const isDev = process.env.NODE_ENV === "development";
// Dev: "" (use CRA proxy). Prod: REACT_APP_API_URL
const baseURL = isDev ? "" : ENV_URL.replace(/\/+$/, "");

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

// Only set Content-Type for JSON, never for FormData
instance.interceptors.request.use((config) => {
  const isForm = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isForm) {
    if (config.headers?.["Content-Type"]) delete config.headers["Content-Type"];
  } else {
    const m = (config.method || "get").toLowerCase();
    if (!["get", "head"].includes(m)) {
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
