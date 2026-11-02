import { useEffect } from "react";

// Calls `onOutside` when a mousedown lands outside the element held by `ref`.
export default function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handle = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
