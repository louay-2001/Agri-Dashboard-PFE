'use client';

import { useState } from 'react';
import {
  deleteGateway,
  dispatchDashboardDataUpdated,
  getAllGateways,
  getApiErrorMessage,
  getGateway,
  saveGateway
} from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import DeviceListModal from './DeviceListModal';

const initialGatewayState = {
  id: '',
  name: '',
  ipAddress: '',
  macAddress: '',
  markOrModel: '',
  addressOrLocation: '',
  latitude: '',
  longitude: '',
};

const normalizeGateway = (data) => ({
  id: data.id || data.gatewayId || '',
  name: data.name || '',
  ipAddress: data.ipAddress || '',
  macAddress: data.macAddress || '',
  markOrModel: data.markOrModel || '',
  addressOrLocation: data.addressOrLocation || '',
  latitude: data.latitude !== undefined && data.latitude !== null ? data.latitude.toString() : '',
  longitude: data.longitude !== undefined && data.longitude !== null ? data.longitude.toString() : '',
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

const parseCoordinate = (rawValue, label, min, max) => {
  const parsed = parseOptionalNumber(rawValue, `${label} must be numeric`);
  if (parsed.error || parsed.value === undefined) {
    return parsed;
  }
  if (parsed.value < min || parsed.value > max) {
    return { error: `${label} must be between ${min} and ${max}` };
  }
  return parsed;
};

function GatewayForm() {
  const [formData, setFormData] = useState(initialGatewayState);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isExistingGateway, setIsExistingGateway] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [gatewayListData, setGatewayListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const isBusy = isLoading || isSubmitting || isListLoading;

  const clearForm = () => {
    setFormData(initialGatewayState);
    setSelectedId('');
    setIsEditing(false);
    setIsExistingGateway(false);
    setIsSubmitting(false);
    setMessage({ type: '', text: '' });
  };

  const handleAddNew = () => {
    clearForm();
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Enter details for the new gateway.' });
  };

  const handleGet = async () => {
    const gatewayId = parseRequiredInteger(
      selectedId,
      'Please enter a Gateway ID to get.',
      'Gateway ID must be a valid number'
    );
    if (gatewayId.error) {
      setMessage({ type: 'error', text: gatewayId.error });
      return;
    }

    setIsLoading(true);
    try {
      const data = await getGateway(gatewayId.value);
      const normalized = normalizeGateway(data);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingGateway(true);
      setMessage({ type: 'success', text: `Gateway ${normalized.id} loaded.` });
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load gateway.') });
      clearForm();
      setSelectedId(String(gatewayId.value));
    } finally {
      setIsLoading(false);
    }
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

    const gatewayId = parseRequiredInteger(
      selectedId,
      isExistingGateway ? 'Gateway ID is required' : 'Gateway ID is required in create mode',
      'Gateway ID must be a valid number'
    );
    if (gatewayId.error) {
      setMessage({ type: 'error', text: gatewayId.error });
      return;
    }

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Gateway name is required' });
      return;
    }

    if (!formData.ipAddress.trim()) {
      setMessage({ type: 'error', text: 'IP address is required' });
      return;
    }

    if (!formData.macAddress.trim()) {
      setMessage({ type: 'error', text: 'MAC address is required' });
      return;
    }

    const latitude = parseCoordinate(formData.latitude, 'Latitude', -90, 90);
    if (latitude.error) {
      setMessage({ type: 'error', text: latitude.error });
      return;
    }

    const longitude = parseCoordinate(formData.longitude, 'Longitude', -180, 180);
    if (longitude.error) {
      setMessage({ type: 'error', text: longitude.error });
      return;
    }

    const payload = {
      id: gatewayId.value,
      name: formData.name.trim(),
      ipAddress: formData.ipAddress.trim(),
      macAddress: formData.macAddress.trim(),
      markOrModel: formData.markOrModel.trim() || undefined,
      addressOrLocation: formData.addressOrLocation.trim() || undefined,
      latitude: latitude.value,
      longitude: longitude.value,
    };

    setIsSubmitting(true);
    try {
      const savedData = await saveGateway(payload, { isUpdate: isExistingGateway });
      const normalized = normalizeGateway(savedData);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingGateway(true);
      setMessage({
        type: 'success',
        text: isExistingGateway
          ? `Gateway ${normalized.id} updated successfully.`
          : `Gateway ${normalized.id} created successfully.`
      });
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to save gateway.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !isExistingGateway) {
      setMessage({ type: 'error', text: 'Load the gateway you want to delete first.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete gateway ${selectedId}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteGateway(selectedId);
      setMessage({ type: 'success', text: `Gateway ${selectedId} deleted.` });
      clearForm();
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete gateway.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowList = async () => {
    setIsListModalOpen(true);
    setIsListLoading(true);
    try {
      const data = await getAllGateways();
      setGatewayListData(data);
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load gateway list.') });
      setIsListModalOpen(false);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedId || !isExistingGateway) {
      setMessage({ type: 'error', text: 'Load a gateway first or click Add New.' });
      return;
    }
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Editing mode enabled.' });
  };

  const gatewayColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'macAddress', label: 'MAC Address' },
    { key: 'addressOrLocation', label: 'Location' },
    { key: 'markOrModel', label: 'Mark/Model' },
  ];

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4 max-w-3xl p-4 bg-white dark:bg-neutral-800 shadow rounded-lg">
        {message.text && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'error'
                ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                : message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="getId">Gateway ID</Label>
            <Input
              id="getId"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              placeholder="Enter ID"
              disabled={isBusy}
            />
          </div>

          <Button type="button" onClick={handleGet} disabled={isBusy}>
            {isLoading ? 'Loading...' : 'Get Gateway'}
          </Button>

          <Button type="button" onClick={handleShowList} disabled={isBusy}>
            {isListLoading ? 'Loading List...' : 'Show List'}
          </Button>

          <Button type="button" onClick={handleAddNew} disabled={isBusy}>
            Add New Gateway
          </Button>

          <Button type="button" onClick={handleEdit} disabled={isBusy || isEditing}>
            Edit
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayName">Gateway Name</Label>
            <Input id="gatewayName" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayIpAddress">IP Address</Label>
            <Input id="gatewayIpAddress" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} placeholder="Enter IP address" required disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayMacAddress">MAC Address</Label>
            <Input id="gatewayMacAddress" name="macAddress" value={formData.macAddress} onChange={handleInputChange} placeholder="Enter MAC address" required disabled={!isEditing || isBusy} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayMark">Gateway Mark/Model</Label>
            <Input id="gatewayMark" name="markOrModel" value={formData.markOrModel} onChange={handleInputChange} placeholder="Enter mark/model" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayAddress">Location/Address</Label>
            <Input id="gatewayAddress" name="addressOrLocation" value={formData.addressOrLocation} onChange={handleInputChange} placeholder="Enter location/address" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayLatitude">Latitude</Label>
            <Input id="gatewayLatitude" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Enter latitude" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayLongitude">Longitude</Label>
            <Input id="gatewayLongitude" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Enter longitude" disabled={!isEditing || isBusy} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="submit" disabled={!isEditing || isBusy}>
            {isSubmitting ? 'Saving...' : 'Save Gateway'}
          </Button>
          <Button type="button" onClick={handleDelete} disabled={isBusy}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </form>

      <DeviceListModal
        isOpen={isListModalOpen}
        setIsOpen={setIsListModalOpen}
        data={gatewayListData}
        columns={gatewayColumns}
        isLoading={isListLoading}
      />
    </>
  );
}

export default GatewayForm;
