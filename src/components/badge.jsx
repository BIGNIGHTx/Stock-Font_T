import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = "px-2 py-1 rounded text-xs font-bold transition-colors duration-200 inline-block";

    const variants = {
        default: "bg-slate-100 text-slate-600",
        outline: "bg-transparent border border-slate-200", // Outline variant keeps border if explicitly requested
        // Custom semantic variants (Borderless as requested)
        blue: "text-blue-600 bg-blue-100",
        emerald: "text-emerald-600 bg-emerald-100",
        rose: "text-rose-600 bg-rose-100",
        slate: "text-slate-600 bg-slate-100"
    };

    const selectedVariant = variants[variant] || variants.default;

    return (
        <span className={`${baseStyles} ${selectedVariant} ${className}`}>
            {children}
        </span>
    );
};
