import React, { createContext, useContext, useState, useRef } from 'react';
import Modal from '../components/Modal';

const AlertContext = createContext({
    alert: () => Promise.resolve(),
    confirm: () => Promise.resolve(true)
});

export const useAlert = () => {
    return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // info, success, error, warning
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false,
        onConfirm: () => { },
        onCancel: () => { }
    });

    const resolver = useRef(null);

    const showAlert = (message, title = 'Notification', type = 'info') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type,
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => {
                    closeModal();
                    resolve(true);
                },
                onCancel: () => {
                    closeModal();
                    resolve(true);
                }
            });
        });
    };

    const showConfirm = (message, title = 'Confirm Action', type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type,
                confirmText,
                cancelText,
                showCancel: true,
                onConfirm: () => {
                    closeModal();
                    resolve(true);
                },
                onCancel: () => {
                    closeModal();
                    resolve(false);
                }
            });
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AlertContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={modalState.onCancel}
                title={modalState.title}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                showCancel={modalState.showCancel}
                onConfirm={modalState.onConfirm}
            >
                {modalState.message}
            </Modal>
        </AlertContext.Provider>
    );
};
