import React from "react";

export function AuroraText({ children, className = "", ...props }) {
    return (
        <span
            className={`bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient bg-300% ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
