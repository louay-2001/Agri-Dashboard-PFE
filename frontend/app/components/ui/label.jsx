// app/components/ui/label.jsx
import PropTypes from 'prop-types';

export function Label({ htmlFor, children, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

Label.propTypes = {
  htmlFor: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};