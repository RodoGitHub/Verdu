import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastNotification = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-4 px-8 py-6 rounded-2xl shadow-2xl border min-w-[400px] animate-[slideIn_0.3s] transition-all
                        ${toast.type === 'success' ? 'bg-white border-l-8 border-l-green-500 text-gray-800' : ''}
                        ${toast.type === 'error' ? 'bg-white border-l-8 border-l-red-500 text-gray-800' : ''}
                        ${toast.type === 'info' ? 'bg-white border-l-8 border-l-blue-500 text-gray-800' : ''}
                    `}
                >
                    {toast.type === 'success' && <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />}
                    {toast.type === 'error' && <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />}
                    {toast.type === 'info' && <AlertCircle className="w-10 h-10 text-blue-500 flex-shrink-0" />}

                    <div className="flex-1">
                        <p className="font-extrabold text-xl mb-1">{toast.title || (toast.type === 'error' ? 'Error' : 'Notificación')}</p>
                        <p className="text-lg text-gray-600 font-medium leading-tight">{toast.message}</p>
                    </div>

                    <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 p-2">
                        <X className="w-6 h-6" />
                    </button>

                    {/* Default duration 10s */}
                    <Timer id={toast.id} removeToast={removeToast} duration={10000} />
                </div>
            ))}
        </div>
    );
};

const Timer = ({ id, removeToast, duration }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, removeToast, duration]);
    return null;
};

export default ToastNotification;
