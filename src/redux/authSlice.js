import { createSlice } from "@reduxjs/toolkit";

const AUTH_TOKEN_KEY = "auth_token";
const ADMIN_TOKEN_KEY = "admin_token";

const initialState = {
    isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),
    isAdmin: !!localStorage.getItem(ADMIN_TOKEN_KEY),
    user: null, // Can be expanded later to store user details
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload || null;
            // Note: Token storage should ideally happen in the component or a thunk, 
            // but state update happens here.
        },
        adminLoginSuccess: (state) => {
            state.isAdmin = true;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.isAdmin = false;
            state.user = null;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(ADMIN_TOKEN_KEY);
        },
        // Useful if we want to sync state without affecting localStorage (e.g. init)
        setAuthState: (state, action) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.isAdmin = action.payload.isAdmin;
        }
    },
});

export const { loginSuccess, adminLoginSuccess, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
