import { useSelector } from 'react-redux';

const MessageToast = () => {
    const message = useSelector((state) => state.message); // [{...}]

    return (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            {message.map((msg) => (
                <div
                    className="toast show"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    key={msg.id}
                >
                    <div className={`toast-header bg-${msg.type} text-white`}>
                        <strong className="me-auto">{msg.title}</strong>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="toast"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="toast-body">{msg.text}</div>
                </div>
            ))}
        </div>
    );
};

export default MessageToast;
