import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isChatOpen: false,
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
    },
});

export const { toggleChat, openChat, closeChat } = uiSlice.actions;
export default uiSlice.reducer;
