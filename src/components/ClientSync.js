import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "./axiosInstance";
import { setCart, cartItemKey } from "../redux/cartSlice";
import { setWishlist, wishlistItemKey } from "../redux/wishlistSlice";

const mergeCart = (local, remote) => {
  const map = new Map();
  const add = (it) => {
    const key = cartItemKey(it);
    if (!key) return;
    const existing = map.get(key);
    if (existing) {
      existing.quantity = Math.max(existing.quantity || 1, it.quantity || 1);
    } else {
      map.set(key, { ...it, quantity: Math.max(1, it.quantity || 1) });
    }
  };
  (Array.isArray(remote) ? remote : []).forEach(add);
  (Array.isArray(local) ? local : []).forEach(add);
  return Array.from(map.values());
};

const mergeWishlist = (local, remote) => {
  const map = new Map();
  const add = (it) => {
    const key = wishlistItemKey(it);
    if (!key) return;
    if (!map.has(key)) map.set(key, it);
  };
  (Array.isArray(remote) ? remote : []).forEach(add);
  (Array.isArray(local) ? local : []).forEach(add);
  return Array.from(map.values());
};

export default function ClientSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const cart = useSelector((s) => s.cart);
  const wishlist = useSelector((s) => s.wishlist);
  const syncing = useRef(false);
  const syncTimer = useRef(null);

  // On login / refresh: pull server cart/wishlist.
  // Only merge if there is genuine guest data in localStorage.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const load = async () => {
      try {
        syncing.current = true;

        // 1. Read guest localStorage BEFORE clearing
        let localCart = [];
        let localWishlist = [];
        try {
          const c = localStorage.getItem("vkart_cart");
          const w = localStorage.getItem("vkart_wishlist");
          if (c) localCart = JSON.parse(c);
          if (w) localWishlist = JSON.parse(w);
        } catch {}

        // 2. Clear immediately — prevents duplication on quick refresh
        try {
          localStorage.removeItem("vkart_cart");
          localStorage.removeItem("vkart_wishlist");
        } catch {}

        // 3. Fetch server state
        const [cartRes, wishRes] = await Promise.all([
          axios.get("/api/profile/cart"),
          axios.get("/api/profile/wishlist"),
        ]);

        if (cancelled) return;

        const serverCart = cartRes?.data?.cart || [];
        const serverWishlist = wishRes?.data?.wishlist || [];

        // 4. Merge only if guest had items (login transition);
        //    otherwise just adopt server state (normal refresh).
        const finalCart = localCart.length
          ? mergeCart(localCart, serverCart)
          : serverCart;
        const finalWishlist = localWishlist.length
          ? mergeWishlist(localWishlist, serverWishlist)
          : serverWishlist;

        dispatch(setCart(finalCart));
        dispatch(setWishlist(finalWishlist));

        // 5. Push back only when we actually merged guest data
        if (localCart.length || localWishlist.length) {
          await Promise.all([
            axios.put("/api/profile/cart", { cart: finalCart }),
            axios.put("/api/profile/wishlist", { wishlist: finalWishlist }),
          ]);
        }
      } catch (err) {
        console.warn("Client sync load failed", err?.message);
      } finally {
        syncing.current = false;
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dispatch]);

  // On cart/wishlist change: debounce sync to server (logged-in only)
  useEffect(() => {
    if (!isAuthenticated || syncing.current) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      axios
        .put("/api/profile/cart", { cart })
        .catch(() => {});
      axios
        .put("/api/profile/wishlist", { wishlist })
        .catch(() => {});
    }, 800);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [isAuthenticated, cart, wishlist]);

  return null;
}
