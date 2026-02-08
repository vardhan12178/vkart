// redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const CART_KEY = "vkart_cart";

const loadCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (state) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  } catch {}
};

const getKey = (it) => {
  const base = it?.productId || it?.externalId || it?._id || it?.id;
  return it?.selectedVariants ? `${base}::${it.selectedVariants}` : base;
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCart(),
  reducers: {
    setCart: (_state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      // Don't persist to localStorage — server is source of truth for
      // authenticated users.  Guest cart is persisted by addToCart / etc.
      return items;
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const qty = Math.max(1, item.quantity || 1);
      const key = getKey(item);
      if (!key) return;

      const existing = state.find((s) => getKey(s) === key);
      if (existing) {
        existing.quantity += qty;
      } else {
        state.push({ ...item, quantity: qty });
      }

      saveCart(state);
    },

    incrementQuantity: (state, action) => {
      const key = action.payload;
      const found = state.find((s) => getKey(s) === key);
      if (found) found.quantity += 1;

      saveCart(state);
    },

    decrementQuantity: (state, action) => {
      const key = action.payload;
      const idx = state.findIndex((s) => getKey(s) === key);
      if (idx !== -1) {
        const it = state[idx];
        if (it.quantity > 1) it.quantity -= 1;
        else state.splice(idx, 1);
      }

      saveCart(state);
    },

    removeFromCart: (state, action) => {
      const key = action.payload;
      const newState = state.filter((s) => getKey(s) !== key);
      saveCart(newState);
      return newState;
    },

    clearCart: () => {
      saveCart([]);
      return [];
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const cartItemKey = getKey;
