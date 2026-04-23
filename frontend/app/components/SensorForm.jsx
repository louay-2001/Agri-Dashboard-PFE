'use client';

// Legacy inventory component retained only for backward compatibility.
// The active device management flow is organization -> farm -> field -> device.

import { useEffect, useState } from 'react';
import {
  deleteSensor,
  dispatchDashboardDataUpdated,
  getAllSensors,
  getApiErrorMessage,
  getSensor,
  saveSensor
} from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import DeviceListModal from './DeviceListModal';

const initialSensorState = {
  id: '',
  name: '',
  type: '',
  measurementType: '',
  measurementUnit: '',
  measurementValue: '',
  precision: '',
  threshold: '',
  nodeId: '',
};

const normalizeSensor = (data) => ({
  id: data.id || data.sensorId || '',
  name: data.name || '',
  type: data.type || '',
  measurementType: data.measurementType || '',
  measurementUnit: data.measurementUnit || '',
  measurementValue: data.measurementValue !== undefined && data.measurementValue !== null ? data.measurementValue.toString() : '',
  precision: data.precision !== undefined && data.precision !== null ? data.precision.toString() : '',
  threshold: data.threshold !== undefined && data.threshold !== null ? data.threshold.toString() : '',
  nodeId: data.nodeId ?? data.node?.id ?? '',
});

const parseRequiredInteger = (rawValue, requiredMessage, invalidMessage) => {
  const value = String(rawValue ?? '').trim();
  if (!value) {
    return { error: requiredMessage };
  }
  if (!/^-?\d+$/.test(value)) {
    return { error: invalidMessage };
  }
  return { value: Number.parseInt(value, 10) };
};

const parseRequiredNumber = (rawValue, requiredMessage, invalidMessage) => {
  const value = String(rawValue ?? '').trim();
  if (!value) {
    return { error: requiredMessage };
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { error: invalidMessage };
  }
  return { value: parsed };
};

const parseOptionalNumber = (rawValue, invalidMessage) => {
  const value = String(rawValue ?? '').trim();
  if (!value) {
    return { value: undefined };
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { error: invalidMessage };
  }
  return { value: parsed };
};

function SensorForm() {
  const [formData, setFormData] = useState(initialSensorState);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isExistingSensor, setIsExistingSensor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [sensorListData, setSensorListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const isBusy = isLoading || isSubmitting || isListLoading;

  useEffect(() => {
    console.warn('[LEGACY UI] SensorForm is deprecated. Use the agritech device flow in /devices instead.');
  }, []);

  const clearForm = () => {
    setFormData(initialSensorState);
    setSelectedId('');
    setIsEditing(false);
    setIsExistingSensor(false);
    setIsSubmitting(false);
    setMessage({ type: '', text: '' });
  };

  const handleAddNew = () => {
    clearForm();
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Enter details for the new sensor.' });
  };

  const handleGet = async () => {
    const sensorId = parseRequiredInteger(
      selectedId,
      'Please enter a Sensor ID.',
      'Sensor ID must be a valid number'
    );
    if (sensorId.error) {
      setMessage({ type: 'error', text: sensorId.error });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await getSensor(sensorId.value);
      const normalized = normalizeSensor(data);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingSensor(true);
      setMessage({ type: 'success', text: `Sensor ${normalized.id} loaded.` });
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load sensor.') });
      clearForm();
      setSelectedId(String(sensorId.value));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedId || !isExistingSensor) {
      setMessage({ type: 'error', text: 'Load a sensor first.' });
      return;
    }
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Editing mode enabled.' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isEditing) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditing || isSubmitting) {
      return;
    }

    const sensorId = parseRequiredInteger(
      selectedId,
      isExistingSensor ? 'Sensor ID is required' : 'Sensor ID is required in create mode',
      'Sensor ID must be a valid number'
    );
    if (sensorId.error) {
      setMessage({ type: 'error', text: sensorId.error });
      return;
    }

    const nodeId = parseRequiredInteger(
      formData.nodeId,
      'Node ID is required',
      'Node ID must be a valid number'
    );
    if (nodeId.error) {
      setMessage({ type: 'error', text: nodeId.error });
      return;
    }

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Sensor name is required' });
      return;
    }

    if (!formData.type.trim()) {
      setMessage({ type: 'error', text: 'Sensor type is required' });
      return;
    }

    const measurementValue = parseRequiredNumber(
      formData.measurementValue,
      'Measurement value is required',
      'Measurement value must be numeric'
    );
    if (measurementValue.error) {
      setMessage({ type: 'error', text: measurementValue.error });
      return;
    }

    const threshold = parseRequiredNumber(
      formData.threshold,
      'Threshold is required',
      'Threshold must be numeric'
    );
    if (threshold.error) {
      setMessage({ type: 'error', text: threshold.error });
      return;
    }

    const precision = parseOptionalNumber(
      formData.precision,
      'Precision must be numeric'
    );
    if (precision.error) {
      setMessage({ type: 'error', text: precision.error });
      return;
    }

    const payload = {
      id: sensorId.value,
      nodeId: nodeId.value,
      name: formData.name.trim(),
      type: formData.type.trim(),
      measurementType: formData.measurementType.trim() || undefined,
      measurementUnit: formData.measurementUnit.trim() || undefined,
      measurementValue: measurementValue.value,
      precision: precision.value,
      threshold: threshold.value,
      node: {
        id: nodeId.value,
      },
    };

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const savedData = await saveSensor(payload, { isUpdate: isExistingSensor });
      const normalized = normalizeSensor(savedData);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingSensor(true);
      setMessage({
        type: 'success',
        text: isExistingSensor
          ? `Sensor ${normalized.id} updated successfully.`
          : `Sensor ${normalized.id} created successfully.`
      });
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to save sensor.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !isExistingSensor) {
      setMessage({ type: 'error', text: 'Load the sensor you want to delete first.' });
      return;
    }
    if (!window.confirm(`Delete sensor ${selectedId}?`)) {
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await deleteSensor(selectedId);
      setMessage({ type: 'success', text: `Sensor ${selectedId} deleted.` });
      clearForm();
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete sensor.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowList = async () => {
    setIsListLoading(true);
    setMessage({ type: '', text: '' });
    setIsListModalOpen(true);
    try {
      const data = await getAllSensors();
      setSensorListData(data);
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load sensor list.') });
      setIsListModalOpen(false);
    } finally {
      setIsListLoading(false);
    }
  };

  const sensorColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'measurementType', label: 'Measurement Type' },
    { key: 'measurementUnit', label: 'Unit' },
    { key: 'measurementValue', label: 'Value' },
    { key: 'precision', label: 'Precision' },
    { key: 'threshold', label: 'Threshold' },
    { key: 'nodeId', label: 'Node ID' },
  ];

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4 max-w-3xl p-4 bg-white dark:bg-neutral-800 shadow rounded-lg">
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          Legacy sensor UI. Sensor readings now belong to devices in the agritech hierarchy and are ingested through MQTT.
        </div>
        {message.text && (
          <div className={`p-4 text-white ${message.type === 'error' ? 'bg-red-600' : message.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="getSensorId">Sensor ID</Label>
            <Input
              id="getSensorId"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              placeholder="e.g., 1"
              disabled={isBusy}
            />
          </div>
          <Button type="button" onClick={handleGet} disabled={isBusy}>
            {isLoading ? 'Loading...' : 'Get Details'}
          </Button>
          <Button type="button" onClick={handleShowList} disabled={isBusy}>
            {isListLoading ? 'Loading List...' : 'Sensor List'}
          </Button>
          <Button type="button" onClick={handleAddNew} disabled={isBusy}>Add New</Button>
          <Button
            type="button"
            onClick={handleEdit}
            disabled={isBusy || isEditing}
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="ml-auto"
            variant="destructive"
          >
            {isLoading ? 'Deleting...' : 'Delete Loaded'}
          </Button>
        </div>

        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
          {isEditing ? (isExistingSensor ? 'Edit Sensor Details' : 'New Sensor Details') : 'Sensor Details'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label htmlFor="nodeId">Node ID *</Label><Input id="nodeId" name="nodeId" value={formData.nodeId} onChange={handleInputChange} disabled={isBusy || !isEditing} required /></div>
          <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing || isBusy} required /></div>
          <div><Label htmlFor="type">Type *</Label><Input id="type" name="type" value={formData.type} onChange={handleInputChange} disabled={!isEditing || isBusy} required /></div>
          <div><Label htmlFor="measurementType">Measurement Type</Label><Input id="measurementType" name="measurementType" value={formData.measurementType} onChange={handleInputChange} disabled={!isEditing || isBusy} /></div>
          <div><Label htmlFor="measurementUnit">Measurement Unit</Label><Input id="measurementUnit" name="measurementUnit" value={formData.measurementUnit} onChange={handleInputChange} disabled={!isEditing || isBusy} /></div>
          <div><Label htmlFor="measurementValue">Measurement Value *</Label><Input id="measurementValue" name="measurementValue" type="number" value={formData.measurementValue} onChange={handleInputChange} disabled={!isEditing || isBusy} required /></div>
          <div><Label htmlFor="precision">Sensor Precision</Label><Input id="precision" name="precision" type="number" value={formData.precision} onChange={handleInputChange} disabled={!isEditing || isBusy} /></div>
          <div><Label htmlFor="threshold">Threshold *</Label><Input id="threshold" name="threshold" type="number" value={formData.threshold} onChange={handleInputChange} disabled={!isEditing || isBusy} required /></div>
        </div>

        <div className="pt-4 text-right">
          <Button type="submit" disabled={!isEditing || isBusy} variant="primary">
            {isSubmitting ? 'Saving...' : 'Save Sensor'}
          </Button>
        </div>
      </form>

      <DeviceListModal
        isOpen={isListModalOpen}
        setIsOpen={setIsListModalOpen}
        data={sensorListData}
        columns={sensorColumns}
        isLoading={isListLoading}
      />
    </>
  );
}

export default SensorForm;
