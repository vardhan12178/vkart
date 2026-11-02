import { useEffect, useState } from "react";

// Returns `value` after it has stopped changing for `ms` milliseconds.
export default function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
