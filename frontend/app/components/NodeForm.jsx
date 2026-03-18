'use client';

import { useState } from 'react';
import { getNode, saveNode, deleteNode, getAllNodes } from '../lib/api';
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

function NodeForm() {
  const [formData, setFormData] = useState(initialNodeState);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [nodeListData, setNodeListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const clearForm = () => {
    setFormData(initialNodeState);
    setSelectedId('');
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleAddNew = () => {
    clearForm();
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Enter details for the new node.' });
  };

  const handleGet = async () => {
    if (!selectedId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Node ID to get.' });
      return;
    }
    setIsLoading(true);
    try {
      const data = await getNode(selectedId.trim());
      setFormData({
        id: data.id || data.nodeId || '',
        name: data.name || '',
        ipAddress: data.ipAddress || '',
        macAddress: data.macAddress || '',
        markOrModel: data.markOrModel || '',
        addressOrLocation: data.addressOrLocation || '',
        latitude: data.latitude !== undefined ? data.latitude.toString() : '',
        longitude: data.longitude !== undefined ? data.longitude.toString() : '',
        gatewayId: data.gatewayId || ''
      });
      setSelectedId(data.id || data.nodeId || '');
      setIsEditing(false);
      setMessage({ type: 'success', text: `Node ${selectedId.trim()} loaded.` });
    } catch (error) {
      console.error('Get Node Error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load node.' });
      clearForm();
      setSelectedId(selectedId.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isEditing) setMessage({ type: '', text: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault(); // ← ESSENTIEL !
    if (!isEditing) return;

    if (!formData.name.trim() || !formData.gatewayId.trim()) {
      setMessage({ type: 'error', text: 'Name and Gateway ID are required.' });
      return;
    }

    const payload = {
      ...formData,
      latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : undefined,
      id: formData.id,
    };

    setIsLoading(true);
    try {
      const savedData = await saveNode(payload);
      setFormData({
        id: savedData.id || savedData.nodeId || '',
        name: savedData.name || '',
        ipAddress: savedData.ipAddress || '',
        macAddress: savedData.macAddress || '',
        markOrModel: savedData.markOrModel || '',
        addressOrLocation: savedData.addressOrLocation || '',
        latitude: savedData.latitude !== undefined ? savedData.latitude.toString() : '',
        longitude: savedData.longitude !== undefined ? savedData.longitude.toString() : '',
        gatewayId: savedData.gatewayId || ''
      });
      setSelectedId(savedData.id || savedData.nodeId || '');
      setIsEditing(false);
      setMessage({ type: 'success', text: `Node ${savedData.id || savedData.nodeId} saved successfully.` });
    } catch (error) {
      console.error('Save Node Error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save node.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id && !selectedId) {
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
    } catch (error) {
      console.error('Delete Node Error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete node.' });
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
      console.error('Get All Nodes Error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load node list.' });
      setIsListModalOpen(false);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedId) {
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
            <Input id="getId" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="Enter Node ID" />
          </div>

          <Button type="button" onClick={handleGet} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Node'}
          </Button>

          <Button type="button" onClick={handleShowList}>
            Show List
          </Button>

          <Button type="button" onClick={handleAddNew}>
            Add New Node
          </Button>

          <Button type="button" onClick={handleEdit} disabled={isEditing}>
            Edit
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="nodeName">Node Name</Label>
            <Input id="nodeName" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter node name" required disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="gatewayId">Gateway ID</Label>
            <Input id="gatewayId" name="gatewayId" value={formData.gatewayId} onChange={handleInputChange} placeholder="Enter gateway ID" required disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input id="ipAddress" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} placeholder="Enter IP address" disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="macAddress">MAC Address</Label>
            <Input id="macAddress" name="macAddress" value={formData.macAddress} onChange={handleInputChange} placeholder="Enter MAC address" disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="markOrModel">Mark / Model</Label>
            <Input id="markOrModel" name="markOrModel" value={formData.markOrModel} onChange={handleInputChange} placeholder="Enter mark or model" disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="addressOrLocation">Address / Location</Label>
            <Input id="addressOrLocation" name="addressOrLocation" value={formData.addressOrLocation} onChange={handleInputChange} placeholder="Enter address or location" disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Enter latitude" disabled={!isEditing} />
          </div>

          <div className="flex-grow min-w-[150px]">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Enter longitude" disabled={!isEditing} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="submit" disabled={!isEditing}>
            Save Node
          </Button>
          <Button type="button" onClick={handleDelete} disabled={isLoading}>
            Delete
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