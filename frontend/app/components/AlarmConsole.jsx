'use client';

import React, { useEffect, useState } from 'react';
import { getAllAlerts } from '../lib/api';

const getSeverityClass = (value, threshold, acknowledged) => {
  if (acknowledged) return '';

  const numericValue = Number(value ?? 0);
  const numericThreshold = Number(threshold ?? 0);

  if (numericValue > numericThreshold + 1.5) {
    return 'bg-red-100 text-red-600 dark:text-red-400 font-bold';
  }

  if (numericValue > numericThreshold + 0.5) {
    return 'bg-orange-100 text-orange-600 dark:text-orange-400 font-semibold';
  }

  return 'bg-yellow-100 text-yellow-600 dark:text-yellow-400';
};

function AlarmConsole() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getAllAlerts();

        const initializedAlerts = Array.isArray(data)
          ? data.map((alert, index) => ({
              id: alert.id ?? index,
              timestamp: alert.timestamp ?? new Date().toISOString(),
              device: alert.device ?? 'Unknown Device',
              type: alert.type ?? 'unknown',
              value: Number(alert.value ?? 0),
              threshold: Number(alert.threshold ?? 0),
              description: alert.description ?? 'No description',
              acknowledged: false,
            }))
          : [];

        setAlerts(initializedAlerts);
      } catch (err) {
        console.error('Erreur lors du chargement des alertes :', err);
        setError('Impossible de charger les alertes');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  return (
    <div className="h-full w-full overflow-auto bg-neutral-50 dark:bg-neutral-800">
      <div className="p-2">
        <h3 className="text-md font-semibold text-neutral-800 dark:text-neutral-100 px-2 pb-2 pt-1">
          Alarm Console
        </h3>

        {error && (
          <div className="mx-2 mb-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-xs">
            <thead className="bg-neutral-200 dark:bg-neutral-700 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 font-semibold w-[12%]">Timestamp</th>
                <th className="px-2 py-2 font-semibold w-[12%]">Device</th>
                <th className="px-2 py-2 font-semibold w-[12%]">Type</th>
                <th className="px-2 py-2 font-semibold w-[12%]">Value</th>
                <th className="px-2 py-2 font-semibold w-[12%]">Threshold</th>
                <th className="px-2 py-2 font-semibold w-[30%]">Description</th>
                <th className="px-2 py-2 font-semibold w-[10%]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Chargement...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-neutral-500">
                    Aucune alerte.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={getSeverityClass(
                      alert.value,
                      alert.threshold,
                      alert.acknowledged
                    )}
                  >
                    <td className="px-2 py-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-2">{alert.device}</td>
                    <td className="px-2 py-2 capitalize">{alert.type}</td>
                    <td className="px-2 py-2">{Number(alert.value).toFixed(2)}</td>
                    <td className="px-2 py-2">{alert.threshold}</td>
                    <td className="px-2 py-2">{alert.description}</td>
                    <td className="px-2 py-2">
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          Ack
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium">Acked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AlarmConsole;