import React from 'react';

export function Text({ as: Component = 'p', className = '', children, ...props }) {
    return (
        <Component
            className={`${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}
