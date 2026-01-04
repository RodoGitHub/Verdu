import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '../components/ToastNotification';
import ConfirmModal from '../components/ConfirmModal';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    // --- Toast State ---
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', title = '') => {
        const id = Date.now() + Math.random(); // ensure unique
        setToasts(prev => [...prev, { id, message, type, title }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- Confirm Modal State ---
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    const confirm = useCallback(({ title, message, onConfirm, isDestructive = false }) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDestructive,
            onClose: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
    }, []);

    return (
        <UIContext.Provider value={{ addToast, confirm }}>
            {children}

            {/* Render Global UI Components */}
            <ToastNotification toasts={toasts} removeToast={removeToast} />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
};
