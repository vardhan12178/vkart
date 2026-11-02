import { useEffect } from "react";

// Smooth in-page anchor scrolling while a page is mounted (legal pages with a table of contents).
export default function useSmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);
}
