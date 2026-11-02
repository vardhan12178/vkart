import { useEffect, useState } from "react";
import axios from "../axiosInstance";

// Whether a promotional sale is live (lightweight, cached on the server); rechecked per route.
export default function useActiveSale(pathname) {
  const [hasActiveSale, setHasActiveSale] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/sales/active");
        if (!cancelled) setHasActiveSale(!!res.data?.sale);
      } catch {
        if (!cancelled) setHasActiveSale(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return hasActiveSale;
}
