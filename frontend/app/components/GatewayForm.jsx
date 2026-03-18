'use client';

import { useState } from 'react';
import { getGateway, saveGateway, deleteGateway, getAllGateways } from '../lib/api';
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

function GatewayForm() {
    const [formData, setFormData] = useState(initialGatewayState);
    const [selectedId, setSelectedId] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [gatewayListData, setGatewayListData] = useState([]);
    const [isListLoading, setIsListLoading] = useState(false);

    const clearForm = () => {
        setFormData(initialGatewayState);
        setSelectedId('');
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleAddNew = () => {
        clearForm();
        setIsEditing(true);
        setMessage({ type: 'info', text: 'Enter details for the new gateway.' });
    };

    const handleGet = async () => {
        if (!selectedId.trim()) {
            setMessage({ type: 'error', text: 'Please enter a Gateway ID to get.' });
            return;
        }
        setIsLoading(true);
        try {
            const data = await getGateway(selectedId.trim());
            setFormData(data);
            setSelectedId(data.id || data.gatewayId || '');
            setIsEditing(false);
            setMessage({ type: 'success', text: `Gateway ${selectedId.trim()} loaded.` });
        } catch (error) {
            console.error('Get Gateway Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to load gateway.' });
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
        e.preventDefault();
        if (!isEditing) return;

        if (!formData.name.trim() || !formData.ipAddress.trim() || !formData.macAddress.trim()) {
            setMessage({ type: 'error', text: 'Name, IP Address, and MAC Address are required.' });
            return;
        }

        const payload = {
            ...formData,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
        };

        setIsLoading(true);
        try {
            const savedData = await saveGateway(payload);
            setFormData(savedData);
            setSelectedId(savedData.id || savedData.gatewayId || '');
            setIsEditing(false);
            setMessage({ type: 'success', text: `Gateway ${savedData.id || savedData.gatewayId} saved successfully.` });
        } catch (error) {
            console.error('Save Gateway Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save gateway.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.id && !formData.gatewayId) {
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
        } catch (error) {
            console.error('Delete Gateway Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to delete gateway.' });
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
            console.error('Get All Gateways Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to load gateway list.' });
            setIsListModalOpen(false);
        } finally {
            setIsListLoading(false);
        }
    };

    const handleEdit = () => {
        if (!formData.id && !formData.gatewayId) {
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
                        <Input id="getId" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="Enter ID" />
                    </div>

                    <Button type="button" onClick={handleGet} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Get Gateway'}
                    </Button>

                    <Button type="button" onClick={handleShowList}>
                        Show List
                    </Button>

                    <Button type="button" onClick={handleAddNew}>
                        Add New Gateway
                    </Button>

                    <Button type="button" onClick={handleEdit}>
                        Edit
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayName">Gateway Name</Label>
                        <Input id="gatewayName" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required />
                    </div>

                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayIpAddress">IP Address</Label>
                        <Input id="gatewayIpAddress" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} placeholder="Enter IP address" required />
                    </div>

                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayMacAddress">MAC Address</Label>
                        <Input id="gatewayMacAddress" name="macAddress" value={formData.macAddress} onChange={handleInputChange} placeholder="Enter MAC address" required />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayMark">Gateway Mark/Model</Label>
                        <Input id="gatewayMark" name="markOrModel" value={formData.markOrModel} onChange={handleInputChange} placeholder="Enter mark/model" />
                    </div>

                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayAddress">Location/Address</Label>
                        <Input id="gatewayAddress" name="addressOrLocation" value={formData.addressOrLocation} onChange={handleInputChange} placeholder="Enter location/address" />
                    </div>

                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayLatitude">Latitude</Label>
                        <Input id="gatewayLatitude" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Enter latitude" />
                    </div>

                    <div className="flex-grow min-w-[150px]">
                        <Label htmlFor="gatewayLongitude">Longitude</Label>
                        <Input id="gatewayLongitude" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Enter longitude" />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="submit" disabled={!isEditing}>
                        Save Gateway
                    </Button>
                    <Button type="button" onClick={handleDelete} disabled={isLoading}>
                        Delete
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
