'use client';

// This page intentionally uses only the agritech hierarchy:
// organization -> farm -> field -> device.
// Legacy gateway/node/sensor components are retained elsewhere only for backward compatibility.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WorkspaceShell from '../components/auth/WorkspaceShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import {
  createDevice,
  deleteDevice,
  getApiErrorMessage,
  getDevices,
  getFields,
  getFarms,
  getLatestReading,
  getOrganizations,
  updateDevice,
} from '../lib/api';
import {
  canManageDevices,
  getCurrentUserRole,
  ROLE_VIEWER,
} from '../lib/auth';

const INITIAL_FORM = {
  fieldId: '',
  firmwareVersion: '',
  status: 'ACTIVE',
};

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

const inputErrorClass = (message) => (message ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '');

export default function DevicesPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [allFields, setAllFields] = useState([]);
  const [fields, setFields] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [latestReading, setLatestReading] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [createdDeviceSecret, setCreatedDeviceSecret] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});

  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId) || null;
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) || null;
  const farmsById = Object.fromEntries(farms.map((farm) => [farm.id, farm]));
  const allFieldsById = Object.fromEntries(allFields.map((field) => [field.id, field]));
  const currentRole = getCurrentUserRole();
  const deviceWriteAllowed = canManageDevices();
  const visibleDevices = selectedFarmId
    ? devices.filter((device) => allFieldsById[device.fieldId]?.farmId === selectedFarmId)
    : devices;

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

        if (!organizationData.length) {
          setPageLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load organizations.'),
          });
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
      setSelectedDeviceId('');
      setLatestReading(null);
      setFormData(INITIAL_FORM);
      setPageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrganizationData() {
      setPageLoading(true);
      setFeedback({ type: '', text: '' });
      setCreatedDeviceSecret(null);
      setLatestReading(null);

      try {
        const [farmData, fieldData, devicePage] = await Promise.all([
          getFarms(selectedOrganizationId),
          getFields(selectedOrganizationId),
          getDevices(selectedOrganizationId),
        ]);

        if (cancelled) {
          return;
        }

        const deviceItems = devicePage?.content ?? [];

        setFarms(farmData);
        setAllFields(fieldData);
        setFields(fieldData);
        setDevices(deviceItems);
        setSelectedDeviceId((currentValue) => (
          deviceItems.some((device) => device.id === currentValue) ? currentValue : ''
        ));
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load farms, fields, and devices.'),
          });
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadOrganizationData();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setFields([]);
      return;
    }

    if (!selectedFarmId) {
      setFields(allFields);
      return;
    }

    let cancelled = false;

    async function loadFarmFields() {
      setFieldsLoading(true);

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
          setFieldsLoading(false);
        }
      }
    }

    loadFarmFields();

    return () => {
      cancelled = true;
    };
  }, [allFields, selectedFarmId, selectedOrganizationId]);

  useEffect(() => {
    if (!selectedDeviceId) {
      return;
    }

    if (!visibleDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId('');
      setLatestReading(null);
      setFormData(INITIAL_FORM);
    }
  }, [selectedDeviceId, visibleDevices]);

  useEffect(() => {
    if (!formData.fieldId || selectedDeviceId) {
      return;
    }

    if (!fields.some((field) => field.id === formData.fieldId)) {
      setFormData((currentValue) => ({
        ...currentValue,
        fieldId: '',
      }));
    }
  }, [fields, formData.fieldId, selectedDeviceId]);

  useEffect(() => {
    if (!selectedDevice || !selectedOrganizationId) {
      setLatestReading(null);
      return;
    }

    let cancelled = false;

    setFormData({
      fieldId: selectedDevice.fieldId || '',
      firmwareVersion: selectedDevice.firmwareVersion || '',
      status: selectedDevice.status || 'ACTIVE',
    });
    setFormErrors({});

    async function loadLatestReading() {
      setReadingLoading(true);

      try {
        const reading = await getLatestReading(selectedOrganizationId, selectedDevice.id);

        if (!cancelled) {
          setLatestReading(reading);
        }
      } catch (error) {
        if (!cancelled) {
          setLatestReading(null);
          setFeedback({
            type: 'error',
            text: getApiErrorMessage(error, 'Unable to load the latest sensor reading.'),
          });
        }
      } finally {
        if (!cancelled) {
          setReadingLoading(false);
        }
      }
    }

    loadLatestReading();

    return () => {
      cancelled = true;
    };
  }, [selectedDevice, selectedOrganizationId]);

  const syncDevices = async (organizationId, preferredSelectedDeviceId = '') => {
    const devicePage = await getDevices(organizationId);
    const deviceItems = devicePage?.content ?? [];
    const nextSelectedDeviceId = deviceItems.some((device) => device.id === preferredSelectedDeviceId)
      ? preferredSelectedDeviceId
      : '';

    setDevices(deviceItems);
    setSelectedDeviceId(nextSelectedDeviceId);

    if (!nextSelectedDeviceId) {
      setLatestReading(null);
    }

    return deviceItems;
  };

  const validateDeviceForm = () => {
    const nextErrors = {};

    if (!selectedOrganizationId) {
      nextErrors.organizationId = 'Select an organization first.';
    }

    if (!formData.fieldId) {
      nextErrors.fieldId = 'Select a field before saving.';
    }

    if (formData.firmwareVersion.trim().length > 100) {
      nextErrors.firmwareVersion = 'Firmware version must not exceed 100 characters.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrganizationChange = (event) => {
    setSelectedOrganizationId(event.target.value);
    setSelectedFarmId('');
    setSelectedDeviceId('');
    setLatestReading(null);
    setFormData(INITIAL_FORM);
    setCreatedDeviceSecret(null);
    setFormErrors({});
    setFeedback({ type: '', text: '' });
  };

  const handleFarmChange = (event) => {
    setSelectedFarmId(event.target.value);
    setSelectedDeviceId('');
    setLatestReading(null);
    setCreatedDeviceSecret(null);
    setFormErrors({});
    setFeedback({ type: '', text: '' });
  };

  const handleNewDevice = () => {
    if (!deviceWriteAllowed) {
      setFeedback({
        type: 'error',
        text: 'Your role has read-only access to devices.',
      });
      return;
    }
    setSelectedDeviceId('');
    setLatestReading(null);
    setCreatedDeviceSecret(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setFeedback({
      type: 'info',
      text: 'Create mode enabled. Select a field and save to register a new device.',
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setFormErrors((currentValue) => ({
      ...currentValue,
      [name]: '',
      organizationId: name === 'fieldId' ? '' : currentValue.organizationId,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!deviceWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to devices.' });
      return;
    }

    if (!validateDeviceForm()) {
      setFeedback({ type: 'error', text: 'Please correct the highlighted device fields.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const normalizedFirmwareVersion = formData.firmwareVersion.trim();

      if (selectedDeviceId) {
        await updateDevice(selectedOrganizationId, selectedDeviceId, {
          fieldId: formData.fieldId,
          firmwareVersion: normalizedFirmwareVersion || undefined,
          status: formData.status,
        });

        await syncDevices(selectedOrganizationId, selectedDeviceId);
        setCreatedDeviceSecret(null);
        setFormErrors({});
        setFeedback({
          type: 'success',
          text: 'Device updated successfully.',
        });
      } else {
        const createdDevice = await createDevice({
          organizationId: selectedOrganizationId,
          fieldId: formData.fieldId,
          firmwareVersion: normalizedFirmwareVersion || undefined,
        });

        await syncDevices(selectedOrganizationId, createdDevice.id);
        setCreatedDeviceSecret({
          deviceIdentifier: createdDevice.deviceIdentifier,
          rawDeviceSecret: createdDevice.rawDeviceSecret,
        });
        setFormErrors({});
        setFeedback({
          type: 'success',
          text: `Device ${createdDevice.deviceIdentifier} created successfully.`,
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to save the device.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deviceWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to devices.' });
      return;
    }
    if (!selectedOrganizationId || !selectedDeviceId) {
      setFeedback({
        type: 'error',
        text: 'Select a device before deleting it.',
      });
      return;
    }

    if (!window.confirm('Delete the selected device?')) {
      return;
    }

    setDeleting(true);
    setFeedback({ type: '', text: '' });

    try {
      await deleteDevice(selectedOrganizationId, selectedDeviceId);
      await syncDevices(selectedOrganizationId);
      setFormData(INITIAL_FORM);
      setFormErrors({});
      setCreatedDeviceSecret(null);
      setLatestReading(null);
      setFeedback({
        type: 'success',
        text: 'Device deleted successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to delete the device.'),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedOrganizationId) {
      return;
    }

    setPageLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const [farmData, fieldData] = await Promise.all([
        getFarms(selectedOrganizationId),
        getFields(selectedOrganizationId),
      ]);

      setFarms(farmData);
      setAllFields(fieldData);

      if (!selectedFarmId) {
        setFields(fieldData);
      }

      await syncDevices(selectedOrganizationId, selectedDeviceId);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to refresh device data.'),
      });
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Device Service"
      title="Device Management"
      description="Manage devices within the organization, farm, and field hierarchy, then inspect the most recent reading for the selected device."
      actions={(
        <>
          <Button type="button" variant="outline" onClick={handleRefresh} disabled={!selectedOrganizationId || pageLoading}>
            {pageLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {deviceWriteAllowed ? (
            <Button type="button" variant="secondary" onClick={handleNewDevice} disabled={!selectedOrganizationId}>
              New Device
            </Button>
          ) : null}
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
              : feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300'
                : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300'
          }`}>
            {feedback.text}
          </div>
        ) : null}

        {currentRole === ROLE_VIEWER ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            Viewer access is read-only here. You can browse devices and inspect readings, but only admins and managers can create, update, or delete devices.
          </div>
        ) : null}

        {createdDeviceSecret ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-semibold">One-time device secret</p>
            <p className="mt-2">
              Device <span className="font-medium">{createdDeviceSecret.deviceIdentifier}</span> was created successfully.
            </p>
            <p className="mt-2 break-all rounded-xl bg-white/80 px-3 py-2 font-mono text-xs dark:bg-neutral-900/70">
              {createdDeviceSecret.rawDeviceSecret}
            </p>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              This raw secret is only returned once by the backend.
            </p>
          </div>
        ) : null}

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="organizationId">Organization</Label>
              <Select
                id="organizationId"
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                disabled={pageLoading || !organizations.length}
                className={inputErrorClass(formErrors.organizationId)}
              >
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
              {formErrors.organizationId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.organizationId}</p> : null}
            </div>

            <div>
              <Label htmlFor="farmId">Farm Filter</Label>
              <Select
                id="farmId"
                value={selectedFarmId}
                onChange={handleFarmChange}
                disabled={!selectedOrganizationId || pageLoading}
              >
                <option value="">All farms</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Visible Fields</p>
              <p className="mt-2 text-2xl font-semibold">
                {fieldsLoading ? '...' : fields.length}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Visible Devices</p>
              <p className="mt-2 text-2xl font-semibold">
                {pageLoading ? '...' : visibleDevices.length}
              </p>
            </div>
          </div>
        </section>

        {!organizations.length && !pageLoading ? (
          <section className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-xl font-semibold">No organizations available</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Create an organization in the agro service first, then come back here to register devices.
            </p>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedDeviceId ? 'Update Device' : 'Create Device'}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedDeviceId
                      ? 'Edit the selected device and save changes.'
                      : 'New devices are created as ACTIVE and receive a generated identifier and secret.'}
                  </p>
                </div>
                {selectedDevice ? (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    {selectedDevice.deviceIdentifier}
                  </span>
                ) : null}
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="selectedOrganizationName">Organization</Label>
                  <Input
                    id="selectedOrganizationName"
                    value={selectedOrganization?.name || ''}
                    disabled
                    placeholder="Select organization first"
                  />
                </div>

                <div>
                  <Label htmlFor="deviceFieldId">Field</Label>
                  <Select
                    id="deviceFieldId"
                    name="fieldId"
                    value={formData.fieldId}
                    onChange={handleFormChange}
                    disabled={!deviceWriteAllowed || !selectedOrganizationId || fieldsLoading || saving}
                    className={inputErrorClass(formErrors.fieldId)}
                  >
                    <option value="">Select field</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                        {farmsById[field.farmId] ? ` - ${farmsById[field.farmId].name}` : ''}
                      </option>
                    ))}
                  </Select>
                  {formErrors.fieldId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.fieldId}</p> : null}
                </div>

                <div>
                  <Label htmlFor="firmwareVersion">Firmware Version</Label>
                  <Input
                    id="firmwareVersion"
                    name="firmwareVersion"
                    value={formData.firmwareVersion}
                    onChange={handleFormChange}
                    placeholder="e.g. v1.0.3"
                    disabled={!deviceWriteAllowed || !selectedOrganizationId || saving}
                    className={inputErrorClass(formErrors.firmwareVersion)}
                  />
                  {formErrors.firmwareVersion ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.firmwareVersion}</p> : null}
                </div>

                <div>
                  <Label htmlFor="deviceStatus">Status</Label>
                  <Select
                    id="deviceStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    disabled={!deviceWriteAllowed || !selectedDeviceId || saving}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </Select>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={handleNewDevice} disabled={!deviceWriteAllowed || !selectedOrganizationId || saving || deleting}>
                    Reset Form
                  </Button>
                  <Button type="submit" disabled={!deviceWriteAllowed || !selectedOrganizationId || saving || deleting}>
                    {saving ? 'Saving...' : selectedDeviceId ? 'Update Device' : 'Create Device'}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={!deviceWriteAllowed || !selectedDeviceId || saving || deleting}>
                    {deleting ? 'Deleting...' : 'Delete Device'}
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-xl font-semibold">Latest Sensor Reading</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {selectedDevice
                  ? `Latest reading for ${selectedDevice.deviceIdentifier}`
                  : 'Select a device to inspect its latest reading.'}
              </p>

              {!selectedDevice ? (
                <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                  No device selected yet.
                </p>
              ) : readingLoading ? (
                <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                  Loading latest reading...
                </p>
              ) : !latestReading ? (
                <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                  No reading is available yet for this device.
                </p>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Temperature</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.temperature, ' C')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Humidity</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.humidity, '%')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Soil Moisture</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMeasurement(latestReading.soilMoisture, '%')}</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Recorded At</p>
                    <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {formatTimestamp(latestReading.recordedAt)}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Devices</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedFarmId
                    ? `Filtered to ${farmsById[selectedFarmId]?.name || 'selected farm'}`
                    : 'Showing all devices in the selected organization.'}
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {visibleDevices.length} device{visibleDevices.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-neutral-200 text-left dark:border-neutral-800">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Identifier</th>
                    <th className="py-3 pr-4 font-semibold">Farm</th>
                    <th className="py-3 pr-4 font-semibold">Field</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-4 font-semibold">Firmware</th>
                    <th className="py-3 pr-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLoading ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-neutral-500 dark:text-neutral-400">
                        Loading devices...
                      </td>
                    </tr>
                  ) : !visibleDevices.length ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-neutral-500 dark:text-neutral-400">
                        No devices found for the current selection.
                      </td>
                    </tr>
                  ) : (
                    visibleDevices.map((device) => {
                      const field = allFieldsById[device.fieldId];
                      const farm = field ? farmsById[field.farmId] : null;

                      return (
                        <tr
                          key={device.id}
                          onClick={() => {
                            setSelectedDeviceId(device.id);
                            setCreatedDeviceSecret(null);
                            setFormErrors({});
                            setFeedback({ type: '', text: '' });
                          }}
                          className={`cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 ${
                            selectedDeviceId === device.id ? 'bg-green-50 dark:bg-green-950/20' : ''
                          }`}
                        >
                          <td className="py-3 pr-4 font-medium">{device.deviceIdentifier}</td>
                          <td className="py-3 pr-4">{farm?.name || 'N/A'}</td>
                          <td className="py-3 pr-4">{field?.name || device.fieldId}</td>
                          <td className="py-3 pr-4">{device.status}</td>
                          <td className="py-3 pr-4">{device.firmwareVersion || 'N/A'}</td>
                          <td className="py-3 pr-4">{formatTimestamp(device.createdAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </>
    </WorkspaceShell>
  );
}
