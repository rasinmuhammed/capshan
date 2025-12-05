import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-500/10 text-red-500' :
                                type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-blue-500/10 text-blue-500'
                            }`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                            <p className="text-zinc-400 leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' :
                                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20' :
                                    'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
