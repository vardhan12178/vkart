import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
});

export default store;

