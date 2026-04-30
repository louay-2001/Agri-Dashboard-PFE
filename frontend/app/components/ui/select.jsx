// app/components/ui/select.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Select = React.forwardRef(({ className = '', children, ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={`block w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white
                 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:focus:bg-neutral-950
                 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </select>
    );
});

Select.displayName = 'Select';

Select.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export { Select };
