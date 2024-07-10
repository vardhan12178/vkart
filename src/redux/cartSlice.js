import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const { id } = action.payload;
      const existingProduct = state.find(item => item.id === id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementQuantity: (state, action) => {
      const id = action.payload;
      const product = state.find(item => item.id === id);
      if (product) {
        product.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const id = action.payload;
      const productIndex = state.findIndex(item => item.id === id);
      if (productIndex !== -1) {
        const product = state[productIndex];
        if (product.quantity > 1) {
          product.quantity -= 1;
        } else {
          state.splice(productIndex, 1);
        }
      }
    },
    clearCart: state => {
      state.splice(0, state.length);
    },
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
