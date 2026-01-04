import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 transform scale-100 transition-all">
                <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`
                            px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95
                            ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}
                        `}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
