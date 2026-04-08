'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DASHBOARD_DATA_UPDATED_EVENT,
  getApiErrorMessage,
  getDashboardAnalytics
} from '../lib/api';

const formatTimestamp = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};

const getPercent = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardAnalytics();
      setAnalytics(data);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError, 'Unable to load analytics data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    const intervalId = window.setInterval(fetchAnalytics, 10000);
    const handleDashboardDataUpdated = () => {
      fetchAnalytics();
    };

    window.addEventListener(DASHBOARD_DATA_UPDATED_EVENT, handleDashboardDataUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(DASHBOARD_DATA_UPDATED_EVENT, handleDashboardDataUpdated);
    };
  }, [fetchAnalytics]);

  const summaryCards = useMemo(() => ([
    { label: 'Gateways', value: analytics?.gatewaysCount ?? 0 },
    { label: 'Nodes', value: analytics?.nodesCount ?? 0 },
    { label: 'Sensors', value: analytics?.sensorsCount ?? 0 },
    { label: 'Active Alerts', value: analytics?.activeAlertsCount ?? 0 },
  ]), [analytics]);

  const sensorsAboveThreshold = analytics?.sensorsAboveThresholdCount ?? 0;
  const sensorsWithinThreshold = analytics?.sensorsWithinThresholdCount ?? 0;
  const totalSensors = analytics?.sensorsCount ?? 0;
  const alertsBySensorType = analytics?.alertsBySensorType ?? [];
  const nodesByGateway = analytics?.nodesByGateway ?? [];
  const latestAlerts = analytics?.latestAlerts ?? [];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            PostgreSQL-backed monitoring overview for the Phase 1 demo.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm"
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">
                {loading ? '...' : card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Alert Monitoring</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Sensors above threshold</span>
                  <span>{loading ? '...' : `${sensorsAboveThreshold}/${totalSensors}`}</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${getPercent(sensorsAboveThreshold, totalSensors)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Sensors within threshold</span>
                  <span>{loading ? '...' : `${sensorsWithinThreshold}/${totalSensors}`}</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${getPercent(sensorsWithinThreshold, totalSensors)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
                  Active alerts by sensor type
                </h3>

                {!alertsBySensorType.length && !loading ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No active alert breakdown available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {alertsBySensorType.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${getPercent(item.value, analytics?.activeAlertsCount ?? 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Infrastructure Distribution</h2>

            {!nodesByGateway.length && !loading ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No node distribution available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {nodesByGateway.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span>{item.value} node{item.value > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${getPercent(item.value, analytics?.nodesCount ?? 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Alerts</h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Last {latestAlerts.length} persisted alert events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Value</th>
                  <th className="py-2 pr-4">Threshold</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-neutral-500">
                      Loading analytics...
                    </td>
                  </tr>
                ) : latestAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-neutral-500">
                      No alert history available.
                    </td>
                  </tr>
                ) : (
                  latestAlerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 pr-4">{formatTimestamp(alert.timestamp)}</td>
                      <td className="py-3 pr-4">{alert.device || 'Unknown'}</td>
                      <td className="py-3 pr-4">{alert.type || 'Unknown'}</td>
                      <td className="py-3 pr-4">{Number(alert.value ?? 0).toFixed(2)}</td>
                      <td className="py-3 pr-4">{alert.threshold}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          alert.active && !alert.acknowledged
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : alert.acknowledged
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                        }`}>
                          {alert.active && !alert.acknowledged ? 'Active' : alert.acknowledged ? 'Acknowledged' : 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analytics;
