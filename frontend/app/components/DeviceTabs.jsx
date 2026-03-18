// app/components/DeviceTabs.jsx
'use client';
import PropTypes from 'prop-types';

function DeviceTabs({ activeTab, onTabChange }) {
  const tabs = ['Gateway', 'Node', 'Sensor'];

  return (
    <div className="mb-6 border-b border-neutral-300 dark:border-neutral-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none
              ${activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-600'
              }`}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab}s {/* Pluralize */}
          </button>
        ))}
      </nav>
    </div>
  );
}

DeviceTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default DeviceTabs;