import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

function ThemeSwitcher({ isDarkMode, onToggleDarkMode }) {
  return (
    <button
      onClick={onToggleDarkMode}
      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-900" // Added focus styles
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <i className="fas fa-sun text-yellow-400 fa-lg" aria-hidden="true"></i> // Added aria-hidden
      ) : (
        <i className="fas fa-moon text-neutral-500 fa-lg" aria-hidden="true"></i> // Added aria-hidden
      )}
    </button>
  );
}

// Add PropTypes
ThemeSwitcher.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
};

export default ThemeSwitcher;
