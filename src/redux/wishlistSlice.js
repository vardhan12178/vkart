import { createSlice } from "@reduxjs/toolkit";

// Reuse the same key logic as cart
const getKey = (it) => it?._id || it?.productId || it?.externalId || it?.id;

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: [],
  reducers: {
    toggleWishlist: (state, action) => {
      const item = action.payload;
      const key = getKey(item);
      if (!key) return;

      const exists = state.find((x) => getKey(x) === key);
      if (exists) {
        return state.filter((x) => getKey(x) !== key);
      } else {
        state.push(item);
      }
    },
    removeFromWishlist: (state, action) => {
      const key = action.payload;
      return state.filter((x) => getKey(x) !== key);
    },
    clearWishlist: () => [],
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;

// optional export for helper use
export const wishlistItemKey = getKey;
