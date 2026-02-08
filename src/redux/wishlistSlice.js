import { createSlice } from "@reduxjs/toolkit";

const WISHLIST_KEY = "vkart_wishlist";

const loadWishlist = () => {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (state) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(state));
  } catch {}
};

// Reuse the same key logic as cart
const getKey = (it) => it?._id || it?.productId || it?.externalId || it?.id;

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: loadWishlist(),
  reducers: {
    setWishlist: (_state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      // Don't persist — server is source of truth once authenticated.
      return items;
    },
    toggleWishlist: (state, action) => {
      const item = action.payload;
      const key = getKey(item);
      if (!key) return;

      const exists = state.find((x) => getKey(x) === key);
      if (exists) {
        const next = state.filter((x) => getKey(x) !== key);
        saveWishlist(next);
        return next;
      } else {
        state.push(item);
        saveWishlist(state);
      }
    },
    removeFromWishlist: (state, action) => {
      const key = action.payload;
      const next = state.filter((x) => getKey(x) !== key);
      saveWishlist(next);
      return next;
    },
    clearWishlist: () => {
      saveWishlist([]);
      return [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist, setWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;

// optional export for helper use
export const wishlistItemKey = getKey;
