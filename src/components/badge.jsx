import React from 'react';
import { Text } from './text';

export const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = "px-2 py-1 rounded text-xs font-bold transition-colors duration-200 inline-block";

    const variants = {
        default: "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-muted",
        outline: "bg-transparent border border-slate-200 dark:border-dark-border",
        // Custom semantic variants (Borderless as requested)
        blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
        slate: "text-slate-600 dark:text-dark-muted bg-slate-100 dark:bg-dark-bg"
    };

    const selectedVariant = variants[variant] || variants.default;

    return (
        <Text as="span" className={`${baseStyles} ${selectedVariant} ${className}`}>
            {children}
        </Text>
    );
};
