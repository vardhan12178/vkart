import { useCallback, useEffect, useRef, useState } from "react";

// Transient success/error message for admin pages. Pair with <AdminToast toast={toast} />.
export default function useAdminToast(ms = 3000) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback(
    (message, type = "success") => {
      clearTimeout(timer.current);
      setToast({ message, type });
      timer.current = setTimeout(() => setToast(null), ms);
    },
    [ms]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast };
}
