import { createSlice } from "@reduxjs/toolkit";

// Auth state is now determined by cookie-based API calls, not localStorage.
// On app mount, App.js will call /api/profile to check if user is logged in.

const initialState = {
    isAuthenticated: false,  // Will be set true after successful login or profile fetch
    isAdmin: false,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload || null;
        },
        adminLoginSuccess: (state) => {
            state.isAdmin = true;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.isAdmin = false;
            state.user = null;
            // No localStorage to clear - backend clears the cookie
        },
        // Used by App.js to set auth state based on profile API response
        setAuthState: (state, action) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.isAdmin = action.payload.isAdmin ?? state.isAdmin;
            if (action.payload.user !== undefined) {
                state.user = action.payload.user;
            }
        }
    },
});

export const { loginSuccess, adminLoginSuccess, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;

