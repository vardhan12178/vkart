import { useCallback, useEffect, useRef, useState } from "react";

// The floating confirmation/error message at the top of the account page.
export default function useProfileToast() {
  const [toast, setToast] = useState({ kind: "success", message: "" });
  const timer = useRef(null);

  const notify = useCallback((kind, message, ms = 1800) => {
    setToast({ kind, message });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast({ kind, message: "" }), ms);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return { toast, notify };
}
