'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const getSeverityClass = (value, threshold) => {
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

function AlarmConsole({ alerts, loading, error, onAcknowledge, readOnly }) {
  const [successMessage, setSuccessMessage] = useState('');
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleAcknowledge = async (id) => {
    setAcknowledgingId(id);
    setSuccessMessage('');
    setActionError('');

    try {
      await onAcknowledge(id);
      setSuccessMessage('Alert acknowledged.');
    } catch (err) {
      setActionError('Impossible d\'acknowledge l\'alerte');
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-neutral-50 dark:bg-neutral-800">
      <div className="p-2">
        <h3 className="text-md font-semibold text-neutral-800 dark:text-neutral-100 px-2 pb-2 pt-1">
          Alarm Console
        </h3>

        {successMessage && (
          <div className="mx-2 mb-3 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-2 text-sm">
            {successMessage}
          </div>
        )}

        {(actionError || error) && (
          <div className="mx-2 mb-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 text-sm">
            {actionError || error}
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
                <th className={`px-2 py-2 font-semibold ${readOnly ? 'w-[40%]' : 'w-[30%]'}`}>Description</th>
                {!readOnly ? (
                  <th className="px-2 py-2 font-semibold w-[10%]">Action</th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={readOnly ? 6 : 7} className="text-center py-4">
                    Chargement...
                  </td>
                </tr>
              ) : !alerts?.length ? (
                <tr>
                  <td colSpan={readOnly ? 6 : 7} className="text-center py-4 text-neutral-500">
                    Aucune alerte.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={getSeverityClass(alert.value, alert.threshold)}
                  >
                    <td className="px-2 py-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-2">{alert.device}</td>
                    <td className="px-2 py-2 capitalize">{alert.type}</td>
                    <td className="px-2 py-2">{Number(alert.value).toFixed(2)}</td>
                    <td className="px-2 py-2">{alert.threshold}</td>
                    <td className="px-2 py-2">{alert.description}</td>
                    {!readOnly ? (
                      <td className="px-2 py-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgingId === alert.id}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded"
                        >
                          {acknowledgingId === alert.id ? 'Acking...' : 'Ack'}
                        </button>
                      </td>
                    ) : null}
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

AlarmConsole.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    device: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    threshold: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    description: PropTypes.string,
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onAcknowledge: PropTypes.func,
  readOnly: PropTypes.bool,
};

AlarmConsole.defaultProps = {
  alerts: [],
  loading: false,
  error: '',
  onAcknowledge: async () => {},
  readOnly: false,
};

export default AlarmConsole;
