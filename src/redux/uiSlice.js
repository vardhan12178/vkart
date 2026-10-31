import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isChatOpen: false,
    // A question handed to the assistant from elsewhere (e.g. "Ask VKart about ..." in search)
    chatPrompt: null,
    // Slide-out cart: open after "Add to cart", with the line just added highlighted
    miniCart: { open: false, lastKey: null },
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleChat: (state) => {
            state.isChatOpen = !state.isChatOpen;
        },
        openChat: (state) => {
            state.isChatOpen = true;
        },
        closeChat: (state) => {
            state.isChatOpen = false;
        },
        askChat: (state, action) => {
            state.isChatOpen = true;
            state.chatPrompt = { text: String(action.payload || ""), at: Date.now() };
        },
        clearChatPrompt: (state) => {
            state.chatPrompt = null;
        },
        openMiniCart: (state, action) => {
            state.miniCart = { open: true, lastKey: action.payload ?? null };
        },
        closeMiniCart: (state) => {
            state.miniCart = { open: false, lastKey: null };
        },
    },
});

export const { toggleChat, openChat, closeChat, askChat, clearChatPrompt, openMiniCart, closeMiniCart } = uiSlice.actions;
export default uiSlice.reducer;
