'use client';

import { useState } from 'react';
import { getSensor, saveSensor, deleteSensor, getAllSensors } from '../lib/api';
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

function SensorForm() {
  const [formData, setFormData] = useState(initialSensorState);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [sensorListData, setSensorListData] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const clearForm = () => {
    setFormData(initialSensorState);
    setSelectedId('');
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleAddNew = () => {
    clearForm();
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Enter details for the new sensor.' });
  };

  const handleGet = async () => {
    if (!selectedId) return setMessage({ type: 'error', text: 'Please enter a Sensor ID.' });
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await getSensor(selectedId);
      setFormData({
        id: data.id,
        name: data.name,
        type: data.type,
        measurementType: data.measurementType,
        measurementUnit: data.measurementUnit,
        measurementValue: data.measurementValue ?? '',
        precision: data.precision ?? '',
        threshold: data.threshold ?? '',
        nodeId: data.nodeId ?? data.node?.id ?? '',
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: `Sensor ${selectedId} loaded.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load sensor.' });
      clearForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!formData.id) return setMessage({ type: 'error', text: 'Load a sensor first.' });
    setIsEditing(true);
    setMessage({ type: 'info', text: 'Editing mode enabled.' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (isEditing) setMessage({ type: '', text: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!formData.name || !formData.type || !formData.nodeId) {
      return setMessage({ type: 'error', text: 'Node ID, Name, and Type are required.' });
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const payload = {
      ...formData,
      measurementValue: formData.measurementValue !== '' ? parseFloat(formData.measurementValue) : undefined,
      precision: formData.precision !== '' ? parseFloat(formData.precision) : undefined,
      threshold: formData.threshold !== '' ? parseFloat(formData.threshold) : undefined,
      node: {
        id: parseInt(formData.nodeId),
      },
    };

    try {
      const savedData = await saveSensor(payload);
      setFormData({
        id: savedData.id,
        name: savedData.name,
        type: savedData.type,
        measurementType: savedData.measurementType,
        measurementUnit: savedData.measurementUnit,
        measurementValue: savedData.measurementValue ?? '',
        precision: savedData.precision ?? '',
        threshold: savedData.threshold ?? '',
        nodeId: savedData.node?.id ?? '',
      });
      setSelectedId(savedData.id);
      setIsEditing(false);
      setMessage({ type: 'success', text: `Sensor ${savedData.id} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save sensor.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id || formData.id !== selectedId) {
      return setMessage({ type: 'error', text: 'Load the sensor you want to delete first.' });
    }
    if (!window.confirm(`Delete sensor ${selectedId}?`)) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await deleteSensor(selectedId);
      setMessage({ type: 'success', text: `Sensor ${selectedId} deleted.` });
      clearForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete sensor.' });
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
      setMessage({ type: 'error', text: error.message || 'Failed to load sensor list.' });
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
        {message.text && (
          <div className={`p-4 text-white ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
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
              disabled={isLoading}
            />
          </div>
          <Button type="button" onClick={handleGet} disabled={isLoading || !selectedId} variant="secondary">Get Details</Button>
          <Button type="button" onClick={handleShowList} disabled={isLoading || isListLoading} variant="secondary">
            {isListLoading ? 'Loading List...' : 'Sensor List'}
          </Button>
          <Button type="button" onClick={handleAddNew} disabled={isLoading} variant="secondary">Add New</Button>
          <Button
            type="button"
            onClick={handleEdit}
            disabled={isLoading || isEditing || !formData.id}
            variant="secondary"
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading || isEditing || !formData.id || formData.id !== selectedId}
            variant="destructive"
            className="ml-auto"
          >
            Delete Loaded
          </Button>
        </div>

        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
          {isEditing ? (formData.id ? 'Edit Sensor Details' : 'New Sensor Details') : 'Sensor Details'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label htmlFor="nodeId">Node ID *</Label><Input id="nodeId" name="nodeId" value={formData.nodeId} onChange={handleInputChange} disabled={isLoading || !isEditing} required /></div>
          <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing || isLoading} required /></div>
          <div><Label htmlFor="type">Type *</Label><Input id="type" name="type" value={formData.type} onChange={handleInputChange} disabled={!isEditing || isLoading} required /></div>
          <div><Label htmlFor="measurementType">Measurement Type</Label><Input id="measurementType" name="measurementType" value={formData.measurementType} onChange={handleInputChange} disabled={!isEditing || isLoading} /></div>
          <div><Label htmlFor="measurementUnit">Measurement Unit</Label><Input id="measurementUnit" name="measurementUnit" value={formData.measurementUnit} onChange={handleInputChange} disabled={!isEditing || isLoading} /></div>
          <div><Label htmlFor="measurementValue">Measurement Value</Label><Input id="measurementValue" name="measurementValue" type="number" value={formData.measurementValue} onChange={handleInputChange} disabled={!isEditing || isLoading} /></div>
          <div><Label htmlFor="sensorprecision">Sensor Precision</Label><Input id="precision" name="precision" type="number" value={formData.precision} onChange={handleInputChange} disabled={!isEditing || isLoading} /></div>
          <div><Label htmlFor="threshold">Threshold</Label><Input id="threshold" name="threshold" type="number" value={formData.threshold} onChange={handleInputChange} disabled={!isEditing || isLoading} /></div>
        </div>

        <div className="pt-4 text-right">
          <Button type="submit" disabled={!isEditing || isLoading} variant="primary">
            {isEditing ? 'Save Sensor' : 'Save'}
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