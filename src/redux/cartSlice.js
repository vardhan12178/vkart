// redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Prefer Mongo _id, else productId, else externalId, else id (DummyJSON)
const getKey = (it) => it?._id || it?.productId || it?.externalId || it?.id;

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const qty = Math.max(1, item.quantity || 1);
      const key = getKey(item);
      if (!key) return; // can't index without any id

      const existing = state.find((s) => getKey(s) === key);
      if (existing) {
        existing.quantity += qty;
      } else {
        state.push({ ...item, quantity: qty });
      }
    },

    incrementQuantity: (state, action) => {
      const key = action.payload;
      const found = state.find((s) => getKey(s) === key);
      if (found) found.quantity += 1;
    },

    decrementQuantity: (state, action) => {
      const key = action.payload;
      const idx = state.findIndex((s) => getKey(s) === key);
      if (idx !== -1) {
        const it = state[idx];
        if (it.quantity > 1) it.quantity -= 1;
        else state.splice(idx, 1);
      }
    },

    removeFromCart: (state, action) => {
      const key = action.payload;
      return state.filter((s) => getKey(s) !== key);
    },

    clearCart: () => [],
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// (optional) export helper so UI can use the same key logic
export const cartItemKey = getKey;
