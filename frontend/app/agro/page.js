'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WorkspaceShell from '../components/auth/WorkspaceShell';
import DataTable from '../components/demo/DataTable';
import MetricCard from '../components/demo/MetricCard';
import SectionCard from '../components/demo/SectionCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import {
  createFarm,
  createField,
  createOrganization,
  deleteFarm,
  deleteField,
  deleteOrganization,
  getApiErrorMessage,
  getFarms,
  getFields,
  getOrganizations,
  updateFarm,
  updateField,
  updateOrganization,
} from '../lib/api';
import {
  canManageAgroResources,
  canManageOrganizations,
  getCurrentUserRole,
  ROLE_MANAGER,
  ROLE_VIEWER,
} from '../lib/auth';

const EMPTY_ORG = { name: '' };
const EMPTY_FARM = { name: '', location: '' };
const emptyField = (farmId = '') => ({ farmId, name: '', cropType: '', areaHectare: '' });
const orgForm = (item) => ({ name: item?.name || '' });
const farmForm = (item) => ({ name: item?.name || '', location: item?.location || '' });
const fieldForm = (item) => ({
  farmId: item?.farmId || '',
  name: item?.name || '',
  cropType: item?.cropType || '',
  areaHectare: item?.areaHectare === null || item?.areaHectare === undefined ? '' : String(item.areaHectare),
});
const clean = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed : undefined;
};
const formatTimestamp = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const inputErrorClass = (message) => (message ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '');

export default function AgroPage() {
  const [organizations, setOrganizations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [editingOrganizationId, setEditingOrganizationId] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [editingFarmId, setEditingFarmId] = useState('');
  const [editingFieldId, setEditingFieldId] = useState('');
  const [organization, setOrganization] = useState(EMPTY_ORG);
  const [farm, setFarm] = useState(EMPTY_FARM);
  const [field, setField] = useState(emptyField(''));
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const [savingField, setSavingField] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [deletingFarm, setDeletingFarm] = useState(false);
  const [deletingField, setDeletingField] = useState(false);
  const [contextRefreshToken, setContextRefreshToken] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [organizationErrors, setOrganizationErrors] = useState({});
  const [farmErrors, setFarmErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const currentOrganization = organizations.find((item) => item.id === selectedOrganizationId) || null;
  const currentFarm = farms.find((item) => item.id === selectedFarmId) || null;
  const farmsById = Object.fromEntries(farms.map((item) => [item.id, item]));
  const currentRole = getCurrentUserRole();
  const organizationWriteAllowed = canManageOrganizations();
  const agroWriteAllowed = canManageAgroResources();

  const clearContext = () => {
    setFarms([]);
    setFields([]);
    setSelectedFarmId('');
    setEditingFarmId('');
    setEditingFieldId('');
    setFarm(EMPTY_FARM);
    setField(emptyField(''));
    setFarmErrors({});
    setFieldErrors({});
  };

  const applyOrganizations = (items, preferredSelectedId, preferredEditingId) => {
    setOrganizations(items);
    const nextSelectedId = items.some((item) => item.id === preferredSelectedId) ? preferredSelectedId : items[0]?.id ?? '';
    const nextEditingId = items.some((item) => item.id === preferredEditingId) ? preferredEditingId : nextSelectedId;
    setSelectedOrganizationId(nextSelectedId);
    setEditingOrganizationId(nextEditingId);
    setOrganization(nextEditingId ? orgForm(items.find((item) => item.id === nextEditingId)) : EMPTY_ORG);
    if (!nextSelectedId) {
      clearContext();
    }
    return nextSelectedId;
  };

  const refreshOrganizations = async (preferredSelectedId = selectedOrganizationId, preferredEditingId = editingOrganizationId) => {
    setLoading(true);
    try {
      const items = await getOrganizations();
      return applyOrganizations(items, preferredSelectedId, preferredEditingId);
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to load organizations.') });
      clearContext();
      setOrganizations([]);
      setSelectedOrganizationId('');
      setEditingOrganizationId('');
      setOrganization(EMPTY_ORG);
      return '';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const items = await getOrganizations();
        if (!cancelled) {
          applyOrganizations(items, '', '');
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to load organizations.') });
          clearContext();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      clearContext();
      return;
    }
    let cancelled = false;
    async function loadContext() {
      setContextLoading(true);
      try {
        const farmItems = await getFarms(selectedOrganizationId);
        if (cancelled) {
          return;
        }
        setFarms(farmItems);
        const nextSelectedFarmId = farmItems.some((item) => item.id === selectedFarmId) ? selectedFarmId : '';
        const nextEditingFarmId = farmItems.some((item) => item.id === editingFarmId) ? editingFarmId : '';
        setSelectedFarmId(nextSelectedFarmId);
        setEditingFarmId(nextEditingFarmId);
        setFarm(nextEditingFarmId ? farmForm(farmItems.find((item) => item.id === nextEditingFarmId)) : EMPTY_FARM);
        const fieldItems = await getFields(selectedOrganizationId, nextSelectedFarmId || undefined);
        if (cancelled) {
          return;
        }
        setFields(fieldItems);
        const nextEditingFieldId = fieldItems.some((item) => item.id === editingFieldId) ? editingFieldId : '';
        setEditingFieldId(nextEditingFieldId);
        setField(nextEditingFieldId ? fieldForm(fieldItems.find((item) => item.id === nextEditingFieldId)) : emptyField(nextSelectedFarmId || farmItems[0]?.id || ''));
      } catch (error) {
        if (!cancelled) {
          setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to load farms and fields.') });
          setFarms([]);
          setFields([]);
          setEditingFarmId('');
          setEditingFieldId('');
          setFarm(EMPTY_FARM);
          setField(emptyField(''));
        }
      } finally {
        if (!cancelled) {
          setContextLoading(false);
        }
      }
    }
    loadContext();
    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId, selectedFarmId, contextRefreshToken]);

  const validateOrganizationForm = () => {
    const nextErrors = {};

    if (!organization.name.trim()) {
      nextErrors.name = 'Organization name is required.';
    }

    setOrganizationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateFarmForm = () => {
    const nextErrors = {};

    if (!selectedOrganizationId) {
      nextErrors.organizationId = 'Select an organization first.';
    }

    if (!farm.name.trim()) {
      nextErrors.name = 'Farm name is required.';
    }

    setFarmErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateFieldForm = () => {
    const nextErrors = {};
    const areaText = String(field.areaHectare ?? '').trim();

    if (!selectedOrganizationId) {
      nextErrors.organizationId = 'Select an organization first.';
    }

    if (!field.farmId) {
      nextErrors.farmId = 'Select a farm for the field.';
    }

    if (!field.name.trim()) {
      nextErrors.name = 'Field name is required.';
    }

    if (areaText) {
      const areaValue = Number(areaText);

      if (Number.isNaN(areaValue) || areaValue <= 0) {
        nextErrors.areaHectare = 'Area hectare must be a positive number.';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrganizationNameChange = (event) => {
    setOrganization({ name: event.target.value });
    setOrganizationErrors((currentValue) => ({ ...currentValue, name: '' }));
  };

  const handleFarmChange = (name, value) => {
    setFarm((currentValue) => ({ ...currentValue, [name]: value }));
    setFarmErrors((currentValue) => ({ ...currentValue, [name]: '', organizationId: '' }));
  };

  const handleFieldChange = (name, value) => {
    setField((currentValue) => ({ ...currentValue, [name]: value }));
    setFieldErrors((currentValue) => ({ ...currentValue, [name]: '', organizationId: '' }));
  };

  const refreshAll = async () => {
    setRefreshing(true);
    setFeedback({ type: '', text: '' });
    const nextOrganizationId = await refreshOrganizations(selectedOrganizationId, editingOrganizationId);
    if (nextOrganizationId) {
      setContextRefreshToken((value) => value + 1);
    }
    setRefreshing(false);
  };

  const onOrganizationSave = async (event) => {
    event.preventDefault();
    if (!organizationWriteAllowed) {
      setFeedback({ type: 'error', text: 'Only admins can create or update organizations.' });
      return;
    }
    if (!validateOrganizationForm()) {
      setFeedback({ type: 'error', text: 'Please correct the highlighted organization fields.' });
      return;
    }
    const name = organization.name.trim();
    setSavingOrg(true);
    setFeedback({ type: '', text: '' });
    try {
      const saved = editingOrganizationId
        ? await updateOrganization(editingOrganizationId, { name })
        : await createOrganization({ name });
      await refreshOrganizations(saved.id, saved.id);
      setOrganizationErrors({});
      setFeedback({ type: 'success', text: editingOrganizationId ? 'Organization updated successfully.' : 'Organization created successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to save the organization.') });
    } finally {
      setSavingOrg(false);
    }
  };

  const onOrganizationDelete = async () => {
    if (!organizationWriteAllowed) {
      setFeedback({ type: 'error', text: 'Only admins can delete organizations.' });
      return;
    }
    const targetId = editingOrganizationId || selectedOrganizationId;
    if (!targetId) {
      setFeedback({ type: 'error', text: 'Select an organization before deleting it.' });
      return;
    }
    if (!window.confirm('Delete the selected organization?')) {
      return;
    }
    setDeletingOrg(true);
    setFeedback({ type: '', text: '' });
    try {
      await deleteOrganization(targetId);
      await refreshOrganizations(selectedOrganizationId === targetId ? '' : selectedOrganizationId, '');
      setOrganizationErrors({});
      setFeedback({ type: 'success', text: 'Organization deleted successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to delete the organization.') });
    } finally {
      setDeletingOrg(false);
    }
  };

  const onFarmSave = async (event) => {
    event.preventDefault();
    if (!agroWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to farms.' });
      return;
    }
    if (!validateFarmForm()) {
      setFeedback({ type: 'error', text: 'Please correct the highlighted farm fields.' });
      return;
    }
    const name = farm.name.trim();
    setSavingFarm(true);
    setFeedback({ type: '', text: '' });
    try {
      const saved = editingFarmId
        ? await updateFarm(selectedOrganizationId, editingFarmId, { name, location: clean(farm.location) })
        : await createFarm({ organizationId: selectedOrganizationId, name, location: clean(farm.location) });
      setSelectedFarmId(saved.id);
      setEditingFarmId(saved.id);
      setFarm(farmForm(saved));
      setEditingFieldId('');
      setField(emptyField(saved.id));
      setFarmErrors({});
      setFieldErrors({});
      setContextRefreshToken((value) => value + 1);
      setFeedback({ type: 'success', text: editingFarmId ? 'Farm updated successfully.' : 'Farm created successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to save the farm.') });
    } finally {
      setSavingFarm(false);
    }
  };

  const onFarmDelete = async () => {
    if (!agroWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to farms.' });
      return;
    }
    if (!selectedOrganizationId) {
      setFeedback({ type: 'error', text: 'Select an organization first.' });
      return;
    }
    const targetId = editingFarmId || selectedFarmId;
    if (!targetId) {
      setFeedback({ type: 'error', text: 'Select a farm before deleting it.' });
      return;
    }
    if (!window.confirm('Delete the selected farm?')) {
      return;
    }
    setDeletingFarm(true);
    setFeedback({ type: '', text: '' });
    try {
      await deleteFarm(selectedOrganizationId, targetId);
      const nextSelectedFarmId = selectedFarmId === targetId ? '' : selectedFarmId;
      setSelectedFarmId(nextSelectedFarmId);
      setEditingFarmId('');
      setFarm(EMPTY_FARM);
      setEditingFieldId('');
      setField(emptyField(nextSelectedFarmId));
      setFarmErrors({});
      setFieldErrors({});
      setContextRefreshToken((value) => value + 1);
      setFeedback({ type: 'success', text: 'Farm deleted successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to delete the farm.') });
    } finally {
      setDeletingFarm(false);
    }
  };

  const onFieldSave = async (event) => {
    event.preventDefault();
    if (!agroWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to fields.' });
      return;
    }
    if (!validateFieldForm()) {
      setFeedback({ type: 'error', text: 'Please correct the highlighted field inputs.' });
      return;
    }
    const name = field.name.trim();
    const areaText = String(field.areaHectare ?? '').trim();
    let areaHectare;
    if (areaText) {
      areaHectare = Number(areaText);
    }
    setSavingField(true);
    setFeedback({ type: '', text: '' });
    try {
      const payload = {
        farmId: field.farmId,
        name,
        cropType: clean(field.cropType),
        areaHectare,
      };
      const saved = editingFieldId
        ? await updateField(selectedOrganizationId, editingFieldId, payload)
        : await createField({ organizationId: selectedOrganizationId, ...payload });
      const matchingFarm = farms.find((item) => item.id === saved.farmId);
      setSelectedFarmId(saved.farmId);
      setEditingFieldId(saved.id);
      setField(fieldForm(saved));
      setFieldErrors({});
      if (matchingFarm) {
        setEditingFarmId(matchingFarm.id);
        setFarm(farmForm(matchingFarm));
      }
      setContextRefreshToken((value) => value + 1);
      setFeedback({ type: 'success', text: editingFieldId ? 'Field updated successfully.' : 'Field created successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to save the field.') });
    } finally {
      setSavingField(false);
    }
  };

  const onFieldDelete = async () => {
    if (!agroWriteAllowed) {
      setFeedback({ type: 'error', text: 'Your role has read-only access to fields.' });
      return;
    }
    if (!selectedOrganizationId) {
      setFeedback({ type: 'error', text: 'Select an organization first.' });
      return;
    }
    if (!editingFieldId) {
      setFeedback({ type: 'error', text: 'Select a field before deleting it.' });
      return;
    }
    if (!window.confirm('Delete the selected field?')) {
      return;
    }
    setDeletingField(true);
    setFeedback({ type: '', text: '' });
    try {
      await deleteField(selectedOrganizationId, editingFieldId);
      setEditingFieldId('');
      setField(emptyField(selectedFarmId || farms[0]?.id || ''));
      setFieldErrors({});
      setContextRefreshToken((value) => value + 1);
      setFeedback({ type: 'success', text: 'Field deleted successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to delete the field.') });
    } finally {
      setDeletingField(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="Agro Service"
      title="Hierarchy Management"
      description="Manage organizations, their farms, and the fields that define the agritech hierarchy used by devices and sensor readings."
      actions={(
        <>
          <Button type="button" variant="outline" onClick={refreshAll} disabled={loading || contextLoading || refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Link href="/dashboard"><Button type="button" variant="outline">Overview</Button></Link>
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
          }`}>{feedback.text}</div>
        ) : null}

        {currentRole === ROLE_VIEWER ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            Viewer access is read-only here. You can browse organizations, farms, and fields, but only admins and managers can make changes.
          </div>
        ) : null}

        {currentRole === ROLE_MANAGER ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            Manager access can create and update farms and fields, but organization changes are reserved for admins.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Organizations" value={organizations.length} accent="bg-green-500" />
          <MetricCard label="Farms" value={farms.length} accent="bg-emerald-500" />
          <MetricCard label="Fields" value={fields.length} accent="bg-lime-500" />
          <MetricCard label="Current Scope" value={currentFarm ? currentFarm.name : currentOrganization?.name || 'None'} accent="bg-teal-500" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Organizations"
            subtitle="Select an organization to drive farms and fields."
            action={<Button type="button" variant="secondary" onClick={() => { setEditingOrganizationId(''); setOrganization(EMPTY_ORG); setOrganizationErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for organizations.' }); }} disabled={!organizationWriteAllowed || savingOrg || deletingOrg}>New Organization</Button>}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={onOrganizationSave} className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" value={organization.name} onChange={handleOrganizationNameChange} placeholder="Enter organization name" disabled={!organizationWriteAllowed || savingOrg || deletingOrg} className={inputErrorClass(organizationErrors.name)} />
                  {organizationErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{organizationErrors.name}</p> : null}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" disabled={!organizationWriteAllowed || savingOrg || deletingOrg}>{savingOrg ? 'Saving...' : editingOrganizationId ? 'Update Organization' : 'Create Organization'}</Button>
                  <Button type="button" variant="destructive" onClick={onOrganizationDelete} disabled={!organizationWriteAllowed || savingOrg || deletingOrg}>{deletingOrg ? 'Deleting...' : 'Delete Organization'}</Button>
                </div>
              </form>

              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Created', key: (item) => formatTimestamp(item.createdAt) },
                ]}
                rows={organizations}
                getRowKey={(item) => item.id}
                selectedRowKey={selectedOrganizationId}
                onRowClick={(item) => {
                  setSelectedOrganizationId(item.id);
                  setEditingOrganizationId(item.id);
                  setOrganization(orgForm(item));
                  setOrganizationErrors({});
                  setSelectedFarmId('');
                  setEditingFarmId('');
                  setEditingFieldId('');
                  setFarm(EMPTY_FARM);
                  setField(emptyField(''));
                  setFarmErrors({});
                  setFieldErrors({});
                  setFeedback({ type: '', text: '' });
                }}
                emptyMessage={loading ? 'Loading organizations...' : 'No organizations found.'}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Farms"
            subtitle={currentOrganization ? `Manage farms for ${currentOrganization.name}.` : 'Select an organization first.'}
            action={<Button type="button" variant="secondary" onClick={() => { setEditingFarmId(''); setFarm(EMPTY_FARM); setFarmErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for farms.' }); }} disabled={!agroWriteAllowed || !selectedOrganizationId || savingFarm || deletingFarm}>New Farm</Button>}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={onFarmSave} className="space-y-4">
                <div>
                  <Label htmlFor="farmOrganization">Organization</Label>
                  <Input id="farmOrganization" value={currentOrganization?.name || ''} placeholder="Select organization first" disabled />
                  {farmErrors.organizationId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{farmErrors.organizationId}</p> : null}
                </div>
                <div>
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input id="farmName" value={farm.name} onChange={(event) => handleFarmChange('name', event.target.value)} placeholder="Enter farm name" disabled={!agroWriteAllowed || !selectedOrganizationId || savingFarm || deletingFarm} className={inputErrorClass(farmErrors.name)} />
                  {farmErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{farmErrors.name}</p> : null}
                </div>
                <div>
                  <Label htmlFor="farmLocation">Location</Label>
                  <Input id="farmLocation" value={farm.location} onChange={(event) => handleFarmChange('location', event.target.value)} placeholder="Enter farm location" disabled={!agroWriteAllowed || !selectedOrganizationId || savingFarm || deletingFarm} />
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" disabled={!agroWriteAllowed || !selectedOrganizationId || savingFarm || deletingFarm}>{savingFarm ? 'Saving...' : editingFarmId ? 'Update Farm' : 'Create Farm'}</Button>
                  <Button type="button" variant="destructive" onClick={onFarmDelete} disabled={!agroWriteAllowed || !selectedOrganizationId || savingFarm || deletingFarm}>{deletingFarm ? 'Deleting...' : 'Delete Farm'}</Button>
                </div>
              </form>

              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Location', key: (item) => item.location || 'N/A' },
                  { label: 'Created', key: (item) => formatTimestamp(item.createdAt) },
                ]}
                rows={farms}
                getRowKey={(item) => item.id}
                selectedRowKey={selectedFarmId}
                onRowClick={(item) => {
                  setSelectedFarmId(item.id);
                  setEditingFarmId(item.id);
                  setFarm(farmForm(item));
                  setEditingFieldId('');
                  setField(emptyField(item.id));
                  setFarmErrors({});
                  setFieldErrors({});
                  setFeedback({ type: '', text: '' });
                }}
                emptyMessage={selectedOrganizationId ? contextLoading ? 'Loading farms...' : 'No farms found for this organization.' : 'Select an organization to view farms.'}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Fields"
          subtitle={currentFarm ? `Managing fields for ${currentFarm.name}.` : currentOrganization ? `Showing fields for ${currentOrganization.name}.` : 'Select an organization first.'}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedFarmId} onChange={(event) => { setSelectedFarmId(event.target.value); setEditingFieldId(''); setField(emptyField(event.target.value)); setFieldErrors({}); setFeedback({ type: '', text: '' }); }} disabled={!selectedOrganizationId || contextLoading} className="min-w-[180px]">
                <option value="">All farms</option>
                {farms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
              <Button type="button" variant="secondary" onClick={() => { setEditingFieldId(''); setField(emptyField(selectedFarmId || farms[0]?.id || '')); setFieldErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for fields.' }); }} disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField}>New Field</Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={onFieldSave} className="space-y-4">
              <div>
                <Label htmlFor="fieldFarmId">Farm</Label>
                <Select id="fieldFarmId" value={field.farmId} onChange={(event) => handleFieldChange('farmId', event.target.value)} disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField} className={inputErrorClass(fieldErrors.farmId)}>
                  <option value="">Select farm</option>
                  {farms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
                {fieldErrors.organizationId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.organizationId}</p> : null}
                {fieldErrors.farmId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.farmId}</p> : null}
              </div>
              <div>
                <Label htmlFor="fieldName">Field Name</Label>
                <Input id="fieldName" value={field.name} onChange={(event) => handleFieldChange('name', event.target.value)} placeholder="Enter field name" disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField} className={inputErrorClass(fieldErrors.name)} />
                {fieldErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p> : null}
              </div>
              <div>
                <Label htmlFor="fieldCropType">Crop Type</Label>
                <Input id="fieldCropType" value={field.cropType} onChange={(event) => handleFieldChange('cropType', event.target.value)} placeholder="Enter crop type" disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField} />
              </div>
              <div>
                <Label htmlFor="fieldAreaHectare">Area (ha)</Label>
                <Input id="fieldAreaHectare" type="number" step="0.01" min="0" value={field.areaHectare} onChange={(event) => handleFieldChange('areaHectare', event.target.value)} placeholder="e.g. 12.50" disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField} className={inputErrorClass(fieldErrors.areaHectare)} />
                {fieldErrors.areaHectare ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.areaHectare}</p> : null}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button type="submit" disabled={!agroWriteAllowed || !selectedOrganizationId || !farms.length || savingField || deletingField}>{savingField ? 'Saving...' : editingFieldId ? 'Update Field' : 'Create Field'}</Button>
                <Button type="button" variant="destructive" onClick={onFieldDelete} disabled={!agroWriteAllowed || !editingFieldId || savingField || deletingField}>{deletingField ? 'Deleting...' : 'Delete Field'}</Button>
              </div>
            </form>

            <DataTable
              columns={[
                { label: 'Name', key: 'name' },
                { label: 'Farm', key: (item) => farmsById[item.farmId]?.name || item.farmId },
                { label: 'Crop', key: (item) => item.cropType || 'N/A' },
                { label: 'Area (ha)', key: (item) => item.areaHectare ?? 'N/A' },
                { label: 'Created', key: (item) => formatTimestamp(item.createdAt) },
              ]}
              rows={fields}
              getRowKey={(item) => item.id}
              selectedRowKey={editingFieldId}
              onRowClick={(item) => {
                setEditingFieldId(item.id);
                setField(fieldForm(item));
                setFieldErrors({});
                setFeedback({ type: '', text: '' });
              }}
              emptyMessage={selectedOrganizationId ? contextLoading ? 'Loading fields...' : 'No fields found for the current selection.' : 'Select an organization to view fields.'}
            />
          </div>
        </SectionCard>
      </>
    </WorkspaceShell>
  );
}
