'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import WorkspaceShell from '../components/auth/WorkspaceShell';
import DataTable from '../components/demo/DataTable';
import MetricCard from '../components/demo/MetricCard';
import SectionCard from '../components/demo/SectionCard';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import {
  getApiErrorMessage,
  getDevices,
  getFarms,
  getFields,
  getLatestReading,
  getOrganizations,
  getReadingHistory,
} from '../lib/api';

const formatTimestamp = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};

const formatMeasurement = (value, suffix = '') => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${Number(value).toFixed(1)}${suffix}`;
};

export default function ReadingsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [allFields, setAllFields] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [latestReading, setLatestReading] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);
  const [readingPage, setReadingPage] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId) || null;
  const farmsById = useMemo(() => Object.fromEntries(farms.map((farm) => [farm.id, farm])), [farms]);
  const allFieldsById = useMemo(() => Object.fromEntries(allFields.map((field) => [field.id, field])), [allFields]);

  const visibleDevices = useMemo(() => {
    if (selectedFieldId) {
      return devices.filter((device) => device.fieldId === selectedFieldId);
    }

    if (selectedFarmId) {
      return devices.filter((device) => allFieldsById[device.fieldId]?.farmId === selectedFarmId);
    }

    return devices;
  }, [allFieldsById, devices, selectedFarmId, selectedFieldId]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      setPageLoading(true);

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
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load organizations.'),
          });
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
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
      setAllFields([]);
      setFields([]);
      setDevices([]);
      setSelectedFarmId('');
      setSelectedFieldId('');
      setSelectedDeviceId('');
      setLatestReading(null);
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });
      setPageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadScope() {
      setFiltersLoading(true);
      setFeedback({ type: '', text: '' });
      setLatestReading(null);
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });

      try {
        const [farmData, fieldData, devicePage] = await Promise.all([
          getFarms(selectedOrganizationId),
          getFields(selectedOrganizationId),
          getDevices(selectedOrganizationId),
        ]);

        if (cancelled) {
          return;
        }

        setFarms(farmData);
        setAllFields(fieldData);
        setFields(fieldData);
        setDevices(devicePage?.content ?? []);
        setSelectedFarmId('');
        setSelectedFieldId('');
        setSelectedDeviceId('');
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load farms, fields, and devices.'),
          });
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false);
        }
      }
    }

    loadScope();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId) {
      return;
    }

    if (!selectedFarmId) {
      setFields(allFields);
      return;
    }

    let cancelled = false;

    async function loadFarmFields() {
      setFiltersLoading(true);

      try {
        const fieldData = await getFields(selectedOrganizationId, selectedFarmId);

        if (!cancelled) {
          setFields(fieldData);
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load fields for the selected farm.'),
          });
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false);
        }
      }
    }

    loadFarmFields();

    return () => {
      cancelled = true;
    };
  }, [allFields, selectedFarmId, selectedOrganizationId]);

  useEffect(() => {
    if (selectedFieldId && !fields.some((field) => field.id === selectedFieldId)) {
      setSelectedFieldId('');
    }
  }, [fields, selectedFieldId]);

  useEffect(() => {
    if (selectedDeviceId && !visibleDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId('');
      setLatestReading(null);
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });
    }
  }, [selectedDeviceId, visibleDevices]);

  useEffect(() => {
    if (!selectedOrganizationId || !selectedDeviceId) {
      setLatestReading(null);
      setReadingHistory([]);
      setReadingPage({ totalElements: 0, totalPages: 0, number: 0 });
      return;
    }

    let cancelled = false;

    async function loadReadings() {
      setHistoryLoading(true);

      try {
        const [latest, historyPage] = await Promise.all([
          getLatestReading(selectedOrganizationId, selectedDeviceId),
          getReadingHistory(selectedOrganizationId, selectedDeviceId, { page: 0, size: 50 }),
        ]);

        if (cancelled) {
          return;
        }

        setLatestReading(latest);
        setReadingHistory(historyPage?.content ?? []);
        setReadingPage({
          totalElements: historyPage?.totalElements ?? 0,
          totalPages: historyPage?.totalPages ?? 0,
          number: historyPage?.number ?? 0,
        });
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load device readings.'),
          });
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadReadings();

    return () => {
      cancelled = true;
    };
  }, [selectedDeviceId, selectedOrganizationId]);

  const handleRefresh = async () => {
    if (!selectedOrganizationId) {
      return;
    }

    setRefreshing(true);
    setFeedback({ type: '', text: '' });

    try {
      const [farmData, fieldData, devicePage] = await Promise.all([
        getFarms(selectedOrganizationId),
        getFields(selectedOrganizationId),
        getDevices(selectedOrganizationId),
      ]);

      setFarms(farmData);
      setAllFields(fieldData);
      setFields(selectedFarmId ? await getFields(selectedOrganizationId, selectedFarmId) : fieldData);
      setDevices(devicePage?.content ?? []);

      if (selectedDeviceId) {
        const [latest, historyPage] = await Promise.all([
          getLatestReading(selectedOrganizationId, selectedDeviceId),
          getReadingHistory(selectedOrganizationId, selectedDeviceId, { page: 0, size: 50 }),
        ]);

        setLatestReading(latest);
        setReadingHistory(historyPage?.content ?? []);
        setReadingPage({
          totalElements: historyPage?.totalElements ?? 0,
          totalPages: historyPage?.totalPages ?? 0,
          number: historyPage?.number ?? 0,
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to refresh readings data.'),
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Collection Service"
      title="Sensor Readings"
      description="Monitor the latest telemetry and recent reading history for devices in the agritech hierarchy."
      actions={(
        <>
          <Button type="button" variant="outline" onClick={handleRefresh} disabled={!selectedOrganizationId || refreshing || filtersLoading || historyLoading}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Overview
            </Button>
          </Link>
        </>
      )}
    >
      <>
        {feedback.text ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
              : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300'
          }`}>
            {feedback.text}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Organizations" value={organizations.length} accent="bg-green-500" />
          <MetricCard label="Farms" value={farms.length} accent="bg-emerald-500" />
          <MetricCard label="Fields" value={fields.length} accent="bg-lime-500" />
          <MetricCard label="Visible Devices" value={visibleDevices.length} accent="bg-teal-500" />
        </div>

        <SectionCard title="Scope" subtitle="Choose the hierarchy level and device you want to monitor.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="organizationId">Organization</Label>
              <Select
                id="organizationId"
                value={selectedOrganizationId}
                onChange={(event) => {
                  setSelectedOrganizationId(event.target.value);
                  setSelectedFarmId('');
                  setSelectedFieldId('');
                  setSelectedDeviceId('');
                  setFeedback({ type: '', text: '' });
                }}
                disabled={pageLoading || !organizations.length}
              >
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="farmId">Farm</Label>
              <Select
                id="farmId"
                value={selectedFarmId}
                onChange={(event) => {
                  setSelectedFarmId(event.target.value);
                  setSelectedFieldId('');
                  setSelectedDeviceId('');
                  setFeedback({ type: '', text: '' });
                }}
                disabled={!selectedOrganizationId || filtersLoading}
              >
                <option value="">All farms</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="fieldId">Field</Label>
              <Select
                id="fieldId"
                value={selectedFieldId}
                onChange={(event) => {
                  setSelectedFieldId(event.target.value);
                  setSelectedDeviceId('');
                  setFeedback({ type: '', text: '' });
                }}
                disabled={!selectedOrganizationId || filtersLoading}
              >
                <option value="">All fields</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                    {farmsById[field.farmId] ? ` - ${farmsById[field.farmId].name}` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="deviceId">Device</Label>
              <Select
                id="deviceId"
                value={selectedDeviceId}
                onChange={(event) => {
                  setSelectedDeviceId(event.target.value);
                  setFeedback({ type: '', text: '' });
                }}
                disabled={!selectedOrganizationId || filtersLoading}
              >
                <option value="">Select device</option>
                {visibleDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.deviceIdentifier}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {selectedOrganization ? (
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              Current organization: {selectedOrganization.name}
            </p>
          ) : null}
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="Latest Reading"
            subtitle={selectedDeviceId ? 'Most recent persisted reading for the selected device.' : 'Select a device to inspect its latest reading.'}
          >
            {!selectedDeviceId ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No device selected yet.</p>
            ) : historyLoading ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading readings...</p>
            ) : !latestReading ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No reading is available yet for this device.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Temperature</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.temperature, ' C')}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Humidity</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.humidity, '%')}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Soil Moisture</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.soilMoisture, '%')}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Recorded At</p>
                  <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">{formatTimestamp(latestReading.recordedAt)}</p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Reading History"
            subtitle={selectedDeviceId ? 'Recent readings for the selected device.' : 'Select a device to view its history.'}
          >
            <DataTable
              columns={[
                { label: 'Recorded At', key: (reading) => formatTimestamp(reading.recordedAt) },
                { label: 'Temperature', key: (reading) => formatMeasurement(reading.temperature, ' C') },
                { label: 'Humidity', key: (reading) => formatMeasurement(reading.humidity, '%') },
                { label: 'Soil Moisture', key: (reading) => formatMeasurement(reading.soilMoisture, '%') },
                { label: 'Topic', key: 'mqttTopic' },
              ]}
              rows={readingHistory}
              getRowKey={(reading) => reading.id}
              emptyMessage={historyLoading
                ? 'Loading reading history...'
                : selectedDeviceId
                  ? 'No readings found for this device.'
                  : 'Select a device to view its reading history.'}
            />

            {selectedDeviceId && !historyLoading ? (
              <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                Showing page {readingPage.number + 1} of {Math.max(readingPage.totalPages, 1)} with {readingPage.totalElements} total readings.
              </p>
            ) : null}
          </SectionCard>
        </div>
      </>
    </WorkspaceShell>
  );
}
