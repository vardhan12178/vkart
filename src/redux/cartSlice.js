import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const existingProduct = state.find(item => item.id === action.payload.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementQuantity: (state, action) => {
      const product = state.find(item => item.id === action.payload);
      if (product) {
        product.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const productIndex = state.findIndex(item => item.id === action.payload);
      if (productIndex !== -1) {
        const product = state[productIndex];
        if (product.quantity > 1) {
          product.quantity -= 1;
        } else {
          state.splice(productIndex, 1);
        }
      }
    },
  },
});

export const { addToCart, incrementQuantity, decrementQuantity } = cartSlice.actions;
export default cartSlice.reducer;
