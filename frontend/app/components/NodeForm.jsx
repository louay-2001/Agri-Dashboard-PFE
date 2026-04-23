'use client';

// Legacy inventory component retained only for backward compatibility.
// The active device management flow is organization -> farm -> field -> device.

import { useEffect, useState } from 'react';
import {
  deleteNode,
  dispatchDashboardDataUpdated,
  getAllNodes,
  getApiErrorMessage,
  getNode,
  saveNode
} from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import DeviceListModal from './DeviceListModal';

const initialNodeState = {
  id: '',
  name: '',
  ipAddress: '',
  macAddress: '',
  markOrModel: '',
  addressOrLocation: '',
  latitude: '',
  longitude: '',
  gatewayId: ''
};

const normalizeNode = (data) => ({
  id: data.id || data.nodeId || '',
  name: data.name || '',
  ipAddress: data.ipAddress || '',
  macAddress: data.macAddress || '',
  markOrModel: data.markOrModel || '',
  addressOrLocation: data.addressOrLocation || '',
  latitude: data.latitude !== undefined && data.latitude !== null ? data.latitude.toString() : '',
  longitude: data.longitude !== undefined && data.longitude !== null ? data.longitude.toString() : '',
  gatewayId: data.gatewayId !== undefined && data.gatewayId !== null ? data.gatewayId.toString() : ''
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

function NodeForm() {
  const [formData, setFormData] = useState(initialNodeState);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isExistingNode, setIsExistingNode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [nodeListData, setNodeListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const isBusy = isLoading || isSubmitting || isListLoading;

  useEffect(() => {
    console.warn('[LEGACY UI] NodeForm is deprecated. Use the agritech device flow in /devices instead.');
  }, []);

  const clearForm = () => {
    setFormData(initialNodeState);
    setSelectedId('');
    setIsEditing(false);
    setIsExistingNode(false);
    setIsSubmitting(false);
    setMessage({ type: '', text: '' });
  };

  const handleAddNew = () => {
    clearForm();
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Enter details for the new node.' });
  };

  const handleGet = async () => {
    const nodeId = parseRequiredInteger(
      selectedId,
      'Please enter a Node ID to get.',
      'Node ID must be a valid number'
    );
    if (nodeId.error) {
      setMessage({ type: 'error', text: nodeId.error });
      return;
    }

    setIsLoading(true);
    try {
      const data = await getNode(nodeId.value);
      const normalized = normalizeNode(data);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingNode(true);
      setMessage({ type: 'success', text: `Node ${normalized.id} loaded.` });
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load node.') });
      clearForm();
      setSelectedId(String(nodeId.value));
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

    const nodeId = parseRequiredInteger(
      selectedId,
      isExistingNode ? 'Node ID is required' : 'Node ID is required in create mode',
      'Node ID must be a valid number'
    );
    if (nodeId.error) {
      setMessage({ type: 'error', text: nodeId.error });
      return;
    }

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Node name is required' });
      return;
    }

    const gatewayId = parseRequiredInteger(
      formData.gatewayId,
      'Gateway ID is required',
      'Gateway ID must be a valid number'
    );
    if (gatewayId.error) {
      setMessage({ type: 'error', text: gatewayId.error });
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
      id: nodeId.value,
      name: formData.name.trim(),
      gatewayId: gatewayId.value,
      ipAddress: formData.ipAddress.trim(),
      macAddress: formData.macAddress.trim(),
      markOrModel: formData.markOrModel.trim() || undefined,
      addressOrLocation: formData.addressOrLocation.trim() || undefined,
      latitude: latitude.value,
      longitude: longitude.value,
    };

    setIsSubmitting(true);
    try {
      const savedData = await saveNode(payload, { isUpdate: isExistingNode });
      const normalized = normalizeNode(savedData);
      setFormData(normalized);
      setSelectedId(String(normalized.id));
      setIsEditing(false);
      setIsExistingNode(true);
      setMessage({
        type: 'success',
        text: isExistingNode
          ? `Node ${normalized.id} updated successfully.`
          : `Node ${normalized.id} created successfully.`
      });
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to save node.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !isExistingNode) {
      setMessage({ type: 'error', text: 'Load the node you want to delete first.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete node ${selectedId}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteNode(selectedId);
      setMessage({ type: 'success', text: `Node ${selectedId} deleted.` });
      clearForm();
      dispatchDashboardDataUpdated();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete node.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowList = async () => {
    setIsListLoading(true);
    setIsListModalOpen(true);
    try {
      const data = await getAllNodes();
      setNodeListData(data);
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to load node list.') });
      setIsListModalOpen(false);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedId || !isExistingNode) {
      setMessage({ type: 'error', text: 'Load a node first or click Add New.' });
      return;
    }
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Editing mode enabled.' });
  };

  const nodeColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'gatewayId', label: 'Gateway ID' },
    { key: 'addressOrLocation', label: 'Location' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'macAddress', label: 'MAC Address' },
    { key: 'markOrModel', label: 'Mark/Model' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
  ];

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4 max-w-3xl p-4 bg-white dark:bg-neutral-800 shadow rounded-lg">
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          Legacy node UI. The active device management flow now uses organization -&gt; farm -&gt; field -&gt; device.
        </div>
        {message.text && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'error'
              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
              : message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="getId">Node ID</Label>
            <Input id="getId" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="Enter Node ID" disabled={isBusy} />
          </div>

          <Button type="button" onClick={handleGet} disabled={isBusy}>
            {isLoading ? 'Loading...' : 'Get Node'}
          </Button>

          <Button type="button" onClick={handleShowList} disabled={isBusy}>
            {isListLoading ? 'Loading List...' : 'Show List'}
          </Button>

          <Button type="button" onClick={handleAddNew} disabled={isBusy}>
            Add New Node
          </Button>

          <Button type="button" onClick={handleEdit} disabled={isBusy || isEditing}>
            Edit
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="nodeNameInput">Node Name</Label>
            <Input id="nodeNameInput" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter node name" required disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayId">Gateway ID</Label>
            <Input id="gatewayId" name="gatewayId" value={formData.gatewayId} onChange={handleInputChange} placeholder="Enter gateway ID" required disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input id="ipAddress" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} placeholder="Enter IP address" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="macAddress">MAC Address</Label>
            <Input id="macAddress" name="macAddress" value={formData.macAddress} onChange={handleInputChange} placeholder="Enter MAC address" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="markOrModel">Mark / Model</Label>
            <Input id="markOrModel" name="markOrModel" value={formData.markOrModel} onChange={handleInputChange} placeholder="Enter mark or model" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="addressOrLocation">Address / Location</Label>
            <Input id="addressOrLocation" name="addressOrLocation" value={formData.addressOrLocation} onChange={handleInputChange} placeholder="Enter address or location" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Enter latitude" disabled={!isEditing || isBusy} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Enter longitude" disabled={!isEditing || isBusy} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="submit" disabled={!isEditing || isBusy}>
            {isSubmitting ? 'Saving...' : 'Save Node'}
          </Button>
          <Button type="button" onClick={handleDelete} disabled={isBusy}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </form>

      <DeviceListModal
        isOpen={isListModalOpen}
        setIsOpen={setIsListModalOpen}
        data={nodeListData}
        columns={nodeColumns}
        isLoading={isListLoading}
      />
    </>
  );
}

export default NodeForm;
