import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { createMessage, removeMessage } from '../slice/messageSlice';

export default function useMessage() {
    const dispatch = useDispatch();

    const showSuccess = useCallback((message) => {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        dispatch(
            createMessage({
                id: messageId,
                success: true,
                message,
            })
        );
        setTimeout(() => {
            dispatch(removeMessage(messageId));
        }, 2000);
    }, [dispatch]);

    const showError = useCallback((message) => {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        dispatch(
            createMessage({
                id: messageId,
                success: false,
                message,
            })
        );
        setTimeout(() => {
            dispatch(removeMessage(messageId));
        }, 2000);
    }, [dispatch]);

    return {
        showSuccess,
        showError,
    };
}
