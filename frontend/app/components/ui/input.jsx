// app/components/ui/input.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={`block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                  bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                  disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
};

export { Input };
