// app/components/ui/select.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Select = React.forwardRef(({ className = '', children, ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={`block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm
                 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
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