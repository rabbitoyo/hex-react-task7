import { createSlice } from '@reduxjs/toolkit';

export const messageSlice = createSlice({
    name: 'message',
    initialState: [],
    reducers: {
        createMessage: (state, action) => {
            state.push({
                id: action.payload.id,
                type: action.payload.success ? 'success' : 'danger',
                title: action.payload.success ? '成功' : '失敗',
                text: action.payload.message,
            });
        },
        removeMessage: (state, action) => {
            return state.filter((message) => message.id !== action.payload);
        },
    },
});

export const { createMessage, removeMessage } = messageSlice.actions;

export default messageSlice.reducer;
