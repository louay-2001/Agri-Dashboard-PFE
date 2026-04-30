// app/components/ui/button.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:pointer-events-none ring-offset-background shadow-sm hover:-translate-y-[1px]";

  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_14px_30px_rgba(5,150,105,0.22)] dark:bg-emerald-500 dark:hover:bg-emerald-600",
    secondary: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-[0_14px_30px_rgba(220,38,38,0.18)] dark:bg-red-700 dark:hover:bg-red-800",
    outline: "border border-neutral-300 bg-white/70 text-neutral-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 dark:border-neutral-700 dark:bg-neutral-950/70 dark:text-neutral-100 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200",
    ghost: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800",
    link: "underline-offset-4 hover:underline text-emerald-700 dark:text-emerald-300 shadow-none hover:translate-y-0",
  };

  const sizes = {
    default: "h-11 px-4 py-2.5",
    sm: "h-9 px-3 rounded-lg",
    lg: "h-12 px-8 rounded-xl",
  };

  return (
    <button
      ref={ref}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg']),
  children: PropTypes.node,
};

export { Button };
