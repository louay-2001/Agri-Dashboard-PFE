import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

// This is a very basic Navbar structure.
// You might want to integrate ThemeSwitcher here or add branding/user info.
const Navbar = ({ onMenuClick }) => { // Accept onMenuClick prop
  return (
    // Removed outer nav/container as placement is handled in page.js for now
    // This component now primarily provides the toggle button for mobile
    // Consider expanding this into a full Navbar later if needed.
    <button
      className="md:hidden p-2 m-2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 fixed top-0 left-0 z-50" // Example positioning
      onClick={onMenuClick} // Use the passed handler
      aria-label="Toggle Menu" // Add aria-label
    >
      <i className="fas fa-bars fa-lg" aria-hidden="true"></i>
    </button>
  );
};

// Add PropTypes
Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};


export default Navbar;
