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

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={32} className="text-white" />;
            case 'error': return <AlertTriangle size={32} className="text-white" />;
            case 'warning': return <AlertTriangle size={32} className="text-white" />;
            default: return <Info size={32} className="text-white" />;
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-orange-500';
            default: return 'bg-[#26619C]'; // Lapis Blue
        }
    };

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-white rounded-[2rem] shadow-2xl w-[90%] max-w-md overflow-hidden transform transition-all duration-300 ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                {/* Header with Icon */}
                <div className={`${getHeaderColor()} p-6 text-center flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="bg-white/20 p-3 rounded-full mb-2 backdrop-blur-md shadow-inner">
                        {getIcon()}
                    </div>
                    <Text as="h3" className="text-white font-bold text-xl tracking-wide relative z-10">{title}</Text>

                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* Body */}
                <div className="p-8 text-center">
                    <Text className="text-slate-600 text-lg leading-relaxed">{children}</Text>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 flex gap-4 justify-center">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
                        >
                            <Text as="span">{cancelText}</Text>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        className={`flex-1 py-3 px-4 text-white rounded-xl font-bold shadow-lg shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ${getHeaderColor()}`}
                    >
                        <Text as="span">{confirmText}</Text>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Modal;
