'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import AlarmConsole from '../components/AlarmConsole';
import WorkspaceShell from '../components/auth/WorkspaceShell';
import MapComponent from '../components/MapComponent';
import MetricCard from '../components/demo/MetricCard';
import SectionCard from '../components/demo/SectionCard';
import { Button } from '../components/ui/button';
import {
  getApiErrorMessage,
  getLegacyAlerts,
  getLegacyDashboardSummary,
} from '../lib/api';

const formatUpdatedAt = (value) => {
  if (!value) {
    return 'Not loaded yet';
  }

  return new Date(value).toLocaleString();
};

export default function MonitoringPage() {
  const [layoutReady, setLayoutReady] = useState(false);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [alertsNotice, setAlertsNotice] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    setLayoutReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMonitoring() {
      if (!cancelled) {
        setError('');
        setAlertsNotice('');
        setRefreshing(true);
      }

      try {
        const [summaryResult, alertsResult] = await Promise.allSettled([
          getLegacyDashboardSummary(),
          getLegacyAlerts(),
        ]);

        if (cancelled) {
          return;
        }

        if (summaryResult.status === 'fulfilled') {
          setSummary(summaryResult.value);
        } else {
          setSummary(null);
          setError(getApiErrorMessage(summaryResult.reason, 'Unable to load legacy monitoring data.'));
        }

        if (alertsResult.status === 'fulfilled') {
          setAlerts(Array.isArray(alertsResult.value) ? alertsResult.value : []);
        } else {
          setAlerts([]);
          setAlertsNotice('Alerts module not available yet.');
        }

        setLastUpdatedAt(Date.now());
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadMonitoring();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const markers = useMemo(() => summary?.markers ?? [], [summary]);

  return (
    <WorkspaceShell
      eyebrow="Legacy Monitoring"
      title="Infrastructure Monitoring"
      description="This page restores the original map and alarm console as an isolated legacy monitoring workspace. It uses the old gateway/node/sensor monitoring model and is intentionally separate from the agritech organization, farm, field, and device hierarchy."
      actions={(
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            startTransition(() => {
              setRefreshToken((currentValue) => currentValue + 1);
            });
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Monitoring'}
        </Button>
      )}
    >
      <>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          Legacy monitoring only. Marker coordinates and alarm sources come from the older infrastructure model, not from the current agritech hierarchy.
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active Alerts" value={summary?.alertsCount ?? alerts.length} accent="bg-red-500" />
          <MetricCard label="Mapped Gateways" value={summary?.gatewaysCount ?? 0} accent="bg-blue-500" />
          <MetricCard label="Mapped Nodes" value={summary?.nodesCount ?? 0} accent="bg-orange-500" />
          <MetricCard label="Markers" value={markers.length} accent="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Leaflet Cartography"
            subtitle={`Read-only infrastructure map sourced from legacy dashboard markers. Last updated: ${formatUpdatedAt(lastUpdatedAt)}`}
          >
            <div className="h-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900">
              <MapComponent layoutReady={layoutReady} markers={markers} />
            </div>
          </SectionCard>

          <SectionCard
            title="Alarm Console"
            subtitle="Read-only alert stream from the legacy alert-service endpoints."
          >
            {alertsNotice ? (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                {alertsNotice}
              </div>
            ) : null}
            <div className="h-[480px] overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <AlarmConsole
                alerts={alerts}
                loading={loading}
                error=""
                readOnly
              />
            </div>
          </SectionCard>
        </div>
      </>
    </WorkspaceShell>
  );
}
