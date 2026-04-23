// app/components/DeviceTabs.jsx
'use client';
// Legacy navigation component retained only for backward compatibility.
// The active device management flow no longer switches between gateway/node/sensor tabs.

import { useEffect } from 'react';
import PropTypes from 'prop-types';

function DeviceTabs({ activeTab, onTabChange }) {
  const tabs = ['Gateway', 'Node', 'Sensor'];

  useEffect(() => {
    console.warn('[LEGACY UI] DeviceTabs is deprecated. The active /devices page uses the agritech hierarchy only.');
  }, []);

  return (
    <div className="mb-6 border-b border-neutral-300 dark:border-neutral-700">
      <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        Legacy gateway/node/sensor tabs. The active device management flow uses organization -&gt; farm -&gt; field -&gt; device.
      </div>
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
