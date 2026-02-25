import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Text } from './text';

const Modal = ({ isOpen, onClose, title, children, type = 'info', confirmText = 'OK', cancelText = 'Cancel', onConfirm, showCancel = false }) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            const timer = setTimeout(() => setShow(false), 300); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show) return null;

    // 1. Success Layout (Center, Green Icon, Single Button)
    if (type === 'success') {
        return (
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Card Container */}
                <div className={`relative max-w-sm w-full bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-100 dark:border-dark-border p-6 flex flex-col items-center transform transition-all duration-300 ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                    {/* Icon */}
                    <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-4">
                        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Text */}
                    <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text mb-2 text-center">
                        {title || 'Successfully Saved'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-dark-muted text-center mb-6">
                        {children || 'Your changes have been updated on the server.'}
                    </p>

                    {/* Button */}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        className="w-full py-2.5 px-4 bg-[#1e293b] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 cursor-pointer shadow-lg shadow-slate-300/50 dark:shadow-none"
                    >
                        {confirmText || 'Done'}
                    </button>

                </div>
            </div>
        );
    }

    // 2. Confirm/Warning Layout (Split Content, Gray Footer)
    if (type === 'warning' || showCancel) {
        return (
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Card Container */}
                <div className={`relative max-w-md w-full bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden transform transition-all duration-300 ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                    {/* Top Content Section */}
                    <div className="p-6 flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/30">
                            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-dark-text">
                                {title || 'Confirm Action'}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-dark-muted leading-relaxed">
                                {children || 'Are you sure you want to proceed? This action cannot be undone.'}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="bg-gray-50 dark:bg-dark-bg px-6 py-4 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3 transition-colors">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-dark-muted hover:text-slate-800 dark:hover:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                        >
                            {cancelText || 'Cancel'}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#992828] dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer shadow-md dark:shadow-none"
                        >
                            {confirmText || 'Delete'}
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // 3. Fallback / Other Types (Keep simple or standard) - Using Success layout structure but Neutral if needed
    // For now, map 'error' to 'Success Style' but Red, or just let 'info' use simple style. 
    // Given the user request specifically asked for these 2, I'll map 'info'/'error' to the Success layout structure but change colors/icons if needed.
    // Let's reuse the Success layout for Generic Alerts but change icon.

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`relative max-w-sm w-full bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-100 dark:border-dark-border p-6 flex flex-col items-center transform transition-all duration-300 ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                <div className={`flex items-center justify-center h-14 w-14 rounded-full mb-4 ${type === 'error' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                    {type === 'error' ? (
                        <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />
                    ) : (
                        <Info size={24} className="text-blue-500 dark:text-blue-400" />
                    )}
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text mb-2 text-center uppercase tracking-tight">{title}</h2>
                <p className="text-sm text-slate-500 dark:text-dark-muted text-center mb-6">{children}</p>

                <button
                    onClick={() => {
                        if (onConfirm) onConfirm();
                        else onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-[#1e293b] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    );
};

export default Modal;
