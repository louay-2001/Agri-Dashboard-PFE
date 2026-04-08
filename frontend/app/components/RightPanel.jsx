'use client';

import React, { useEffect, useState } from 'react';

function RightPanel({ summary, loading, error }) {
  const [username, setUsername] = useState('');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || '');
    setHasToken(!!localStorage.getItem('token'));
  }, []);

  const alertsCount = summary?.alertsCount ?? 0;
  const gatewaysCount = summary?.gatewaysCount ?? 0;
  const nodesCount = summary?.nodesCount ?? 0;
  const sensorsCount = summary?.sensorsCount ?? 0;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">
          System Information
        </h3>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            User:{' '}
            <span className="font-medium text-neutral-800 dark:text-neutral-100">
              {username || 'Unknown'}
            </span>
          </p>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Session Status:{' '}
            <span className={`font-medium ${hasToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {hasToken ? 'Connected' : 'Disconnected'}
            </span>
          </p>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            JWT Token:{' '}
            <span className={`font-medium ${hasToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {hasToken ? 'Available' : 'Missing'}
            </span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">
          Live System Stats
        </h3>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Alerts</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : alertsCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Gateways</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : gatewaysCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Nodes</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : nodesCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Sensors</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : sensorsCount}
            </span>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
