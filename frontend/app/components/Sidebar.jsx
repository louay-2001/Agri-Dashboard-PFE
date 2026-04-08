import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const Sidebar = forwardRef(({ isOpen, onClose, width, onLogout }, ref) => {
  const menuItems = [
    { icon: 'fa-tachometer-alt', label: 'Dashboard', path: '/dashboard' },
    { icon: 'fa-sitemap', label: 'Device Mgmt', path: '/devices' },
    { icon: 'fa-chart-bar', label: 'Analytics', path: '/analytics' },
  ];

  const baseClasses = 'flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 shadow-lg transition-transform duration-300 ease-in-out flex-shrink-0 overflow-hidden';
  const positioningClasses = 'fixed inset-y-0 left-0 z-50 md:static md:shadow-none md:translate-x-0';
  const visibilityClasses = isOpen ? 'translate-x-0' : '-translate-x-full';
  const dynamicWidthStyle = { width: `${width}px` };

  return (
    <div
      ref={ref}
      style={dynamicWidthStyle}
      className={`${baseClasses} ${positioningClasses} ${visibilityClasses}`}
      aria-hidden={!isOpen && typeof window !== 'undefined' && window.innerWidth < 768}
      aria-modal={isOpen && typeof window !== 'undefined' && window.innerWidth < 768}
      role="navigation"
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-6 mt-2">
          <img
            src="/images/logo1.png"
            alt="Logo Dashboard IoT"
            className="w-20 h-20 rounded-full bg-white shadow-lg ring-2 ring-blue-400 p-2 border border-neutral-200 dark:border-white/20"
            style={{ objectFit: 'contain', backgroundColor: '#fff' }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 focus:outline-none"
            aria-label="Close menu"
          >
            <i className="fas fa-times fa-lg" aria-hidden="true"></i>
          </button>
        </div>

        <ul className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.path}
                className="flex items-center p-2 space-x-3 transition-colors duration-200 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-50"
                aria-label={`Navigate to ${item.label}`}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <i className={`fas ${item.icon} fa-fw w-5 text-center text-neutral-500 dark:text-neutral-400`} aria-hidden="true"></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="pt-4 mt-8 border-t border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl shadow transition-colors duration-200 mb-3"
          >
            Deconnexion
          </button>
          <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Sidebar;
