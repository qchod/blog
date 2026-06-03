import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

const ToastContext = createContext(null);

const FADE_OUT_DURATION = 300;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message, duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, hiding: false }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
            setTimeout(() => removeToast(id), FADE_OUT_DURATION);
        }, duration - FADE_OUT_DURATION);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="app-toast-container">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`app-toast${toast.hiding ? ' hiding' : ''}`}
                        >
                            {toast.message}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
