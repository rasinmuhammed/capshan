import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    success: 'border-green-500/50 bg-green-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    info: 'border-blue-500/50 bg-blue-500/10',
    warning: 'border-capshan-gold/50 bg-capshan-gold/10',
};

const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-capshan-gold',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove();
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`
                relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
                shadow-lg max-w-sm w-full
                ${colors[toast.type]}
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={onRemove}
                className="text-zinc-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${iconColors[toast.type]} opacity-50`}
                style={{ backgroundColor: 'currentColor' }}
            />
        </motion.div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onRemove={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// Convenience hooks
export const useSuccess = () => {
    const { addToast } = useToast();
    return (title: string, message?: string) => addToast({ type: 'success', title, message });
};

export const useError = () => {
    const { addToast } = useToast();
    return (title: string, message?: string) => addToast({ type: 'error', title, message });
};

export const useInfo = () => {
    const { addToast } = useToast();
    return (title: string, message?: string) => addToast({ type: 'info', title, message });
};

export const useWarning = () => {
    const { addToast } = useToast();
    return (title: string, message?: string) => addToast({ type: 'warning', title, message });
};

export default ToastProvider;
