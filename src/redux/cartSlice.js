import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const { id, quantity } = action.payload;
      const existingProduct = state.find((item) => item.id === id);

      if (existingProduct) {
        // If the product already exists, update the quantity
        existingProduct.quantity += quantity;
      } else {
        // If the product is new, add it to the cart with the specified quantity
        state.push({ ...action.payload, quantity });
      }
    },
    incrementQuantity: (state, action) => {
      const id = action.payload;
      const product = state.find((item) => item.id === id);
      if (product) {
        product.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const id = action.payload;
      const productIndex = state.findIndex((item) => item.id === id);
      if (productIndex !== -1) {
        const product = state[productIndex];
        if (product.quantity > 1) {
          product.quantity -= 1;
        } else {
          // Remove the product if the quantity is 1
          state.splice(productIndex, 1);
        }
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      // Filter out the item with the matching id
      return state.filter((item) => item.id !== id);
    },
    clearCart: (state) => {
      return []; // Return a new empty array to ensure immutability
    },
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;