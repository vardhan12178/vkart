import { useCallback, useState } from "react";

export default function useOrderToast() {
  const [toast, setToast] = useState({ type: "", message: "" });

  const notify = useCallback((type, message, ms = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), ms);
  }, []);

  return { toast, notify };
}
