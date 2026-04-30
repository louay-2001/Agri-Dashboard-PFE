'use client';

import { startTransition, useEffect, useState } from 'react';
import WorkspaceShell from '../components/auth/WorkspaceShell';
import DataTable from '../components/demo/DataTable';
import MetricCard from '../components/demo/MetricCard';
import SectionCard from '../components/demo/SectionCard';
import { Button } from '../components/ui/button';
import {
  getApiErrorMessage,
  getDevicesByOrganization,
  getFarms,
  getFields,
  getLatestReading,
  getOrganizations,
  getReadingHistory,
} from '../lib/api';

const formatTimestamp = (value) => {
  if (!value) {
    return 'No reading yet';
  }

  return new Date(value).toLocaleString();
};

const formatMeasurement = (value, suffix = '') => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${Number(value).toFixed(1)}${suffix}`;
};

const buildReadingSummary = (reading) => {
  if (!reading) {
    return 'Waiting for first MQTT publish';
  }

  return [
    `Temp ${formatMeasurement(reading.temperature, ' C')}`,
    `Humidity ${formatMeasurement(reading.humidity, '%')}`,
    `Soil ${formatMeasurement(reading.soilMoisture, '%')}`,
    `Battery ${formatMeasurement(reading.batteryLevel, '%')}`,
  ].join(' | ');
};

export default function DashboardPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [devices, setDevices] = useState([]);
  const [latestReadingsByDevice, setLatestReadingsByDevice] = useState({});
  const [readingHistory, setReadingHistory] = useState([]);
  const [readingPage, setReadingPage] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [refreshToken, setRefreshToken] = useState(0);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const organizationName = organizations.find((organization) => organization.id === selectedOrganizationId)?.name || 'No organization selected';
  const farmNamesById = Object.fromEntries(farms.map((farm) => [farm.id, farm.name]));
  const fieldNamesById = Object.fromEntries(fields.map((field) => [field.id, field.name]));
  const latestSelectedDeviceReading = selectedDeviceId ? latestReadingsByDevice[selectedDeviceId] ?? null : null;

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      setOverviewLoading(true);
      setError('');

      try {
        const organizationData = await getOrganizations();

        if (cancelled) {
          return;
        }

        setOrganizations(organizationData);
        setSelectedOrganizationId((currentValue) => {
          const stillExists = organizationData.some((organization) => organization.id === currentValue);
          return stillExists ? currentValue : organizationData[0]?.id ?? '';
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Unable to load organizations.'));
        }
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setFarms([]);
      setFields([]);
      setDevices([]);
      setLatestReadingsByDevice({});
      setSelectedFarmId('');
      setSelectedDeviceId('');
      return;
    }

    let cancelled = false;

    async function loadOverview() {
      setRefreshing(true);
      setError('');
      setDevices([]);
      setLatestReadingsByDevice({});
      setSelectedDeviceId('');
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });

      try {
        const [farmData, fieldData, devicePage] = await Promise.all([
          getFarms(selectedOrganizationId),
          getFields(selectedOrganizationId),
          getDevicesByOrganization(selectedOrganizationId),
        ]);

        if (cancelled) {
          return;
        }

        const deviceItems = devicePage?.content ?? [];

        setFarms(farmData);
        setFields(fieldData);
        setDevices(deviceItems);
        setSelectedFarmId((currentValue) => (
          currentValue && farmData.some((farm) => farm.id === currentValue) ? currentValue : ''
        ));
        setSelectedDeviceId((currentValue) => (
          deviceItems.some((device) => device.id === currentValue) ? currentValue : deviceItems[0]?.id ?? ''
        ));

        const latestEntries = await Promise.all(
          deviceItems.map(async (device) => [device.id, await getLatestReading(selectedOrganizationId, device.id)])
        );

        if (!cancelled) {
          setLatestReadingsByDevice(Object.fromEntries(latestEntries));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Unable to load farms, fields, devices, and latest readings.'));
        }
      } finally {
        if (!cancelled) {
          setRefreshing(false);
          setOverviewLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId || !selectedDeviceId) {
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);

      try {
        const page = await getReadingHistory(selectedOrganizationId, selectedDeviceId);

        if (cancelled) {
          return;
        }

        setReadingHistory(page?.content ?? []);
        setReadingPage({
          totalElements: page?.totalElements ?? 0,
          totalPages: page?.totalPages ?? 0,
          number: page?.number ?? 0,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Unable to load reading history.'));
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedDeviceId, selectedOrganizationId]);

  const visibleFields = selectedFarmId
    ? fields.filter((field) => field.farmId === selectedFarmId)
    : fields;

  return (
    <WorkspaceShell
      eyebrow="Agritech IoT Demo"
      title="Platform Overview"
      description="Use this dashboard to browse the live demo hierarchy, inspect devices, and verify the most recent MQTT sensor readings flowing into the platform."
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
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      )}
    >
      <>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Organizations" value={organizations.length} accent="bg-green-500" />
          <MetricCard label="Farms" value={farms.length} accent="bg-emerald-500" />
          <MetricCard label="Fields" value={fields.length} accent="bg-lime-500" />
          <MetricCard label="Devices" value={devices.length} accent="bg-teal-500" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              title="Organizations"
              subtitle="Choose an organization to drive the rest of the demo data."
              action={selectedOrganizationId ? (
                <button
                  type="button"
                  onClick={() => startTransition(() => setRefreshToken((currentValue) => currentValue + 1))}
                  className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
                >
                  {refreshing ? 'Refreshing...' : 'Reload'}
                </button>
              ) : null}
            >
              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Created', key: (organization) => formatTimestamp(organization.createdAt) },
                ]}
                rows={organizations}
                getRowKey={(organization) => organization.id}
                selectedRowKey={selectedOrganizationId}
                onRowClick={(organization) => {
                  startTransition(() => {
                    setSelectedOrganizationId(organization.id);
                    setSelectedFarmId('');
                    setSelectedDeviceId('');
                  });
                }}
                emptyMessage={overviewLoading ? 'Loading organizations...' : 'No organizations found.'}
              />
            </SectionCard>

            <SectionCard
              title="Farms"
              subtitle={selectedOrganizationId ? `Organization: ${organizationName}` : 'Select an organization first.'}
              action={selectedFarmId ? (
                <button
                  type="button"
                  onClick={() => startTransition(() => setSelectedFarmId(''))}
                  className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
                >
                  Show all fields
                </button>
              ) : null}
            >
              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Location', key: (farm) => farm.location || 'N/A' },
                  { label: 'Created', key: (farm) => formatTimestamp(farm.createdAt) },
                ]}
                rows={farms}
                getRowKey={(farm) => farm.id}
                selectedRowKey={selectedFarmId}
                onRowClick={(farm) => startTransition(() => setSelectedFarmId(farm.id))}
                emptyMessage={selectedOrganizationId ? 'No farms found for this organization.' : 'Select an organization to view farms.'}
              />
            </SectionCard>

            <SectionCard
              title="Fields"
              subtitle={selectedFarmId
                ? `Filtered to farm: ${farmNamesById[selectedFarmId] || 'Selected farm'}`
                : 'Showing all fields for the selected organization.'}
            >
              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Farm', key: (field) => farmNamesById[field.farmId] || field.farmId },
                  { label: 'Crop', key: (field) => field.cropType || 'N/A' },
                  { label: 'Area (ha)', key: (field) => field.areaHectare ?? 'N/A' },
                ]}
                rows={visibleFields}
                getRowKey={(field) => field.id}
                emptyMessage={selectedOrganizationId ? 'No fields found for this selection.' : 'Select an organization to view fields.'}
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Devices"
              subtitle="Each device row includes the latest MQTT-backed reading summary."
            >
              <DataTable
                columns={[
                  { label: 'Identifier', key: 'deviceIdentifier' },
                  { label: 'Field', key: (device) => fieldNamesById[device.fieldId] || device.fieldId },
                  { label: 'Status', key: 'status' },
                  { label: 'Latest Reading', key: (device) => buildReadingSummary(latestReadingsByDevice[device.id]) },
                ]}
                rows={devices}
                getRowKey={(device) => device.id}
                selectedRowKey={selectedDeviceId}
                onRowClick={(device) => startTransition(() => setSelectedDeviceId(device.id))}
                emptyMessage={selectedOrganizationId ? 'No devices found for this organization.' : 'Select an organization to view devices.'}
              />
            </SectionCard>

            <SectionCard
              title="Selected Device Snapshot"
              subtitle={selectedDeviceId ? 'Latest available reading for the selected device.' : 'Select a device to inspect its latest reading.'}
            >
              {!selectedDeviceId ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No device selected yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Temperature</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestSelectedDeviceReading?.temperature, ' C')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Humidity</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestSelectedDeviceReading?.humidity, '%')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Soil Moisture</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestSelectedDeviceReading?.soilMoisture, '%')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Battery Level</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestSelectedDeviceReading?.batteryLevel, '%')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Recorded At</p>
                    <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {formatTimestamp(latestSelectedDeviceReading?.recordedAt)}
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        <SectionCard
          title="Reading History"
          subtitle={selectedDeviceId
            ? `Recent persisted readings for device ${devices.find((device) => device.id === selectedDeviceId)?.deviceIdentifier || selectedDeviceId}`
            : 'Select a device to inspect its history.'}
        >
          <DataTable
            columns={[
              { label: 'Recorded At', key: (reading) => formatTimestamp(reading.recordedAt) },
              { label: 'Temperature', key: (reading) => formatMeasurement(reading.temperature, ' C') },
              { label: 'Humidity', key: (reading) => formatMeasurement(reading.humidity, '%') },
              { label: 'Soil Moisture', key: (reading) => formatMeasurement(reading.soilMoisture, '%') },
              { label: 'Battery', key: (reading) => formatMeasurement(reading.batteryLevel, '%') },
              { label: 'Topic', key: 'mqttTopic' },
            ]}
            rows={readingHistory}
            getRowKey={(reading) => reading.id}
            emptyMessage={historyLoading
              ? 'Loading reading history...'
              : selectedDeviceId
                ? 'No readings found yet for this device.'
                : 'Select a device to view its reading history.'}
          />

          {selectedDeviceId && !historyLoading ? (
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Showing page {readingPage.number + 1} of {Math.max(readingPage.totalPages, 1)} with {readingPage.totalElements} total readings.
            </p>
          ) : null}
        </SectionCard>
      </>
    </WorkspaceShell>
  );
}
