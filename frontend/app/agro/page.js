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
  createSubscriptionPlan,
  deleteFarm,
  deleteField,
  deleteOrganization,
  deleteSubscriptionPlan,
  getApiErrorMessage,
  getFarms,
  getFields,
  getOrganizations,
  getSubscriptionPlans,
  updateFarm,
  updateField,
  updateOrganization,
  updateSubscriptionPlan,
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
const EMPTY_PLAN = {
  code: '',
  name: '',
  description: '',
  deviceLimit: '',
  fieldLimit: '',
  priceMonthly: '',
  active: 'true',
};
const emptyField = (farmId = '') => ({ farmId, name: '', cropType: '', areaHectare: '' });
const orgForm = (item) => ({ name: item?.name || '', subscriptionPlanId: item?.subscriptionPlanId || '' });
const farmForm = (item) => ({ name: item?.name || '', location: item?.location || '' });
const fieldForm = (item) => ({
  farmId: item?.farmId || '',
  name: item?.name || '',
  cropType: item?.cropType || '',
  areaHectare: item?.areaHectare === null || item?.areaHectare === undefined ? '' : String(item.areaHectare),
});
const planForm = (item) => ({
  code: item?.code || '',
  name: item?.name || '',
  description: item?.description || '',
  deviceLimit: item?.deviceLimit === null || item?.deviceLimit === undefined ? '' : String(item.deviceLimit),
  fieldLimit: item?.fieldLimit === null || item?.fieldLimit === undefined ? '' : String(item.fieldLimit),
  priceMonthly: item?.priceMonthly === null || item?.priceMonthly === undefined ? '' : String(item.priceMonthly),
  active: item ? String(Boolean(item.active)) : 'true',
});
const clean = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed : undefined;
};
const formatTimestamp = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const inputErrorClass = (message) => (message ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '');
const toPositiveInteger = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
};
const toNonNegativeDecimal = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
};

export default function AgroPage() {
  const [organizations, setOrganizations] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [editingOrganizationId, setEditingOrganizationId] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [editingFarmId, setEditingFarmId] = useState('');
  const [editingFieldId, setEditingFieldId] = useState('');
  const [editingPlanId, setEditingPlanId] = useState('');
  const [organization, setOrganization] = useState(EMPTY_ORG);
  const [farm, setFarm] = useState(EMPTY_FARM);
  const [field, setField] = useState(emptyField(''));
  const [plan, setPlan] = useState(EMPTY_PLAN);
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const [savingField, setSavingField] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [deletingFarm, setDeletingFarm] = useState(false);
  const [deletingField, setDeletingField] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [contextRefreshToken, setContextRefreshToken] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [organizationErrors, setOrganizationErrors] = useState({});
  const [farmErrors, setFarmErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [planErrors, setPlanErrors] = useState({});

  const currentOrganization = organizations.find((item) => item.id === selectedOrganizationId) || null;
  const currentFarm = farms.find((item) => item.id === selectedFarmId) || null;
  const farmsById = Object.fromEntries(farms.map((item) => [item.id, item]));
  const plansById = Object.fromEntries(subscriptionPlans.map((item) => [item.id, item]));
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

  const applySubscriptionPlans = (items, preferredEditingId = editingPlanId) => {
    setSubscriptionPlans(items);
    const nextEditingId = items.some((item) => item.id === preferredEditingId) ? preferredEditingId : '';
    setEditingPlanId(nextEditingId);
    setPlan(nextEditingId ? planForm(items.find((item) => item.id === nextEditingId)) : EMPTY_PLAN);
  };

  const refreshOrganizations = async (preferredSelectedId = selectedOrganizationId, preferredEditingId = editingOrganizationId) => {
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
    }
  };

  const refreshSubscriptionPlans = async (preferredEditingId = editingPlanId) => {
    try {
      const items = await getSubscriptionPlans();
      applySubscriptionPlans(items, preferredEditingId);
      return items;
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to load subscription plans.') });
      setSubscriptionPlans([]);
      setEditingPlanId('');
      setPlan(EMPTY_PLAN);
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [organizationItems, planItems] = await Promise.all([
          getOrganizations(),
          getSubscriptionPlans(),
        ]);
        if (!cancelled) {
          applyOrganizations(organizationItems, '', '');
          applySubscriptionPlans(planItems, '');
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to load organizations and subscription plans.') });
          clearContext();
          setSubscriptionPlans([]);
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

  const validatePlanForm = () => {
    const nextErrors = {};
    const deviceLimit = toPositiveInteger(plan.deviceLimit);
    const fieldLimit = toPositiveInteger(plan.fieldLimit);
    const priceMonthly = toNonNegativeDecimal(plan.priceMonthly);

    if (!plan.code.trim()) {
      nextErrors.code = 'Plan code is required.';
    }

    if (!plan.name.trim()) {
      nextErrors.name = 'Plan name is required.';
    }

    if (String(plan.description ?? '').trim().length > 500) {
      nextErrors.description = 'Description must not exceed 500 characters.';
    }

    if (Number.isNaN(deviceLimit)) {
      nextErrors.deviceLimit = 'Device limit must be a positive integer.';
    }

    if (Number.isNaN(fieldLimit)) {
      nextErrors.fieldLimit = 'Field limit must be a positive integer.';
    }

    if (Number.isNaN(priceMonthly)) {
      nextErrors.priceMonthly = 'Monthly price must be a non-negative number.';
    }

    setPlanErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrganizationNameChange = (event) => {
    setOrganization((currentValue) => ({ ...currentValue, name: event.target.value }));
    setOrganizationErrors((currentValue) => ({ ...currentValue, name: '' }));
  };

  const handleOrganizationChange = (name, value) => {
    setOrganization((currentValue) => ({ ...currentValue, [name]: value }));
    setOrganizationErrors((currentValue) => ({ ...currentValue, [name]: '' }));
  };

  const handleFarmChange = (name, value) => {
    setFarm((currentValue) => ({ ...currentValue, [name]: value }));
    setFarmErrors((currentValue) => ({ ...currentValue, [name]: '', organizationId: '' }));
  };

  const handleFieldChange = (name, value) => {
    setField((currentValue) => ({ ...currentValue, [name]: value }));
    setFieldErrors((currentValue) => ({ ...currentValue, [name]: '', organizationId: '' }));
  };

  const handlePlanChange = (name, value) => {
    setPlan((currentValue) => ({ ...currentValue, [name]: value }));
    setPlanErrors((currentValue) => ({ ...currentValue, [name]: '' }));
  };

  const refreshAll = async () => {
    setRefreshing(true);
    setFeedback({ type: '', text: '' });
    setLoading(true);
    const [nextOrganizationId] = await Promise.all([
      refreshOrganizations(selectedOrganizationId, editingOrganizationId),
      refreshSubscriptionPlans(editingPlanId),
    ]);
    if (nextOrganizationId) {
      setContextRefreshToken((value) => value + 1);
    }
    setLoading(false);
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
      const payload = {
        name,
        subscriptionPlanId: organization.subscriptionPlanId || undefined,
      };
      const saved = editingOrganizationId
        ? await updateOrganization(editingOrganizationId, payload)
        : await createOrganization(payload);
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

  const onPlanSave = async (event) => {
    event.preventDefault();
    if (!organizationWriteAllowed) {
      setFeedback({ type: 'error', text: 'Only admins can create or update subscription plans.' });
      return;
    }
    if (!validatePlanForm()) {
      setFeedback({ type: 'error', text: 'Please correct the highlighted subscription plan fields.' });
      return;
    }

    const payload = {
      code: plan.code.trim(),
      name: plan.name.trim(),
      description: clean(plan.description),
      deviceLimit: toPositiveInteger(plan.deviceLimit),
      fieldLimit: toPositiveInteger(plan.fieldLimit),
      priceMonthly: toNonNegativeDecimal(plan.priceMonthly),
      active: plan.active === 'true',
    };

    setSavingPlan(true);
    setFeedback({ type: '', text: '' });
    try {
      const saved = editingPlanId
        ? await updateSubscriptionPlan(editingPlanId, payload)
        : await createSubscriptionPlan(payload);
      await refreshSubscriptionPlans(saved.id);
      await refreshOrganizations(selectedOrganizationId, editingOrganizationId);
      setPlanErrors({});
      setFeedback({ type: 'success', text: editingPlanId ? 'Subscription plan updated successfully.' : 'Subscription plan created successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to save the subscription plan.') });
    } finally {
      setSavingPlan(false);
    }
  };

  const onPlanDelete = async () => {
    if (!organizationWriteAllowed) {
      setFeedback({ type: 'error', text: 'Only admins can delete subscription plans.' });
      return;
    }
    if (!editingPlanId) {
      setFeedback({ type: 'error', text: 'Select a subscription plan before deleting it.' });
      return;
    }
    if (!window.confirm('Delete the selected subscription plan?')) {
      return;
    }

    setDeletingPlan(true);
    setFeedback({ type: '', text: '' });
    try {
      await deleteSubscriptionPlan(editingPlanId);
      await refreshSubscriptionPlans('');
      await refreshOrganizations(selectedOrganizationId, editingOrganizationId);
      setPlanErrors({});
      setFeedback({ type: 'success', text: 'Subscription plan deleted successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: getApiErrorMessage(error, 'Unable to delete the subscription plan.') });
    } finally {
      setDeletingPlan(false);
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
            Manager access can create and update farms and fields, but organization and subscription-plan changes are reserved for admins.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Organizations" value={organizations.length} accent="bg-green-500" />
          <MetricCard label="Farms" value={farms.length} accent="bg-emerald-500" />
          <MetricCard label="Fields" value={fields.length} accent="bg-lime-500" />
          <MetricCard label="Plans" value={subscriptionPlans.length} accent="bg-teal-500" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Organizations"
            subtitle="Select an organization to drive farms and fields."
            action={organizationWriteAllowed ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingOrganizationId(''); setOrganization(EMPTY_ORG); setOrganizationErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for organizations.' }); }} disabled={savingOrg || deletingOrg}>New Organization</Button>
            ) : null}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={onOrganizationSave} className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" value={organization.name} onChange={handleOrganizationNameChange} placeholder="Enter organization name" disabled={!organizationWriteAllowed || savingOrg || deletingOrg} className={inputErrorClass(organizationErrors.name)} />
                  {organizationErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{organizationErrors.name}</p> : null}
                </div>
                <div>
                  <Label htmlFor="organizationSubscriptionPlan">Subscription Plan</Label>
                  <Select
                    id="organizationSubscriptionPlan"
                    value={organization.subscriptionPlanId || ''}
                    onChange={(event) => handleOrganizationChange('subscriptionPlanId', event.target.value)}
                    disabled={!organizationWriteAllowed || savingOrg || deletingOrg}
                  >
                    <option value="">No plan assigned</option>
                    {subscriptionPlans.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" disabled={!organizationWriteAllowed || savingOrg || deletingOrg}>{savingOrg ? 'Saving...' : editingOrganizationId ? 'Update Organization' : 'Create Organization'}</Button>
                  <Button type="button" variant="destructive" onClick={onOrganizationDelete} disabled={!organizationWriteAllowed || savingOrg || deletingOrg}>{deletingOrg ? 'Deleting...' : 'Delete Organization'}</Button>
                </div>
              </form>

              <DataTable
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Plan', key: (item) => item.subscriptionPlanId ? (plansById[item.subscriptionPlanId]?.name || item.subscriptionPlanId) : 'No plan' },
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
            title="Subscription Plans"
            subtitle="Inspect plans and, as admin, create or update the plan catalog used by organizations."
            action={organizationWriteAllowed ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingPlanId(''); setPlan(EMPTY_PLAN); setPlanErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for subscription plans.' }); }} disabled={savingPlan || deletingPlan}>
                New Plan
              </Button>
            ) : null}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={onPlanSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="planCode">Plan Code</Label>
                    <Input id="planCode" value={plan.code} onChange={(event) => handlePlanChange('code', event.target.value)} placeholder="e.g. BASIC" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.code)} />
                    {planErrors.code ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.code}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="planName">Plan Name</Label>
                    <Input id="planName" value={plan.name} onChange={(event) => handlePlanChange('name', event.target.value)} placeholder="Enter plan name" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.name)} />
                    {planErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.name}</p> : null}
                  </div>
                </div>
                <div>
                  <Label htmlFor="planDescription">Description</Label>
                  <Input id="planDescription" value={plan.description} onChange={(event) => handlePlanChange('description', event.target.value)} placeholder="Short plan description" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.description)} />
                  {planErrors.description ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.description}</p> : null}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="planDeviceLimit">Device Limit</Label>
                    <Input id="planDeviceLimit" type="number" min="1" step="1" value={plan.deviceLimit} onChange={(event) => handlePlanChange('deviceLimit', event.target.value)} placeholder="e.g. 25" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.deviceLimit)} />
                    {planErrors.deviceLimit ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.deviceLimit}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="planFieldLimit">Field Limit</Label>
                    <Input id="planFieldLimit" type="number" min="1" step="1" value={plan.fieldLimit} onChange={(event) => handlePlanChange('fieldLimit', event.target.value)} placeholder="e.g. 10" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.fieldLimit)} />
                    {planErrors.fieldLimit ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.fieldLimit}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="planPriceMonthly">Monthly Price</Label>
                    <Input id="planPriceMonthly" type="number" min="0" step="0.01" value={plan.priceMonthly} onChange={(event) => handlePlanChange('priceMonthly', event.target.value)} placeholder="e.g. 19.99" disabled={!organizationWriteAllowed || savingPlan || deletingPlan} className={inputErrorClass(planErrors.priceMonthly)} />
                    {planErrors.priceMonthly ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{planErrors.priceMonthly}</p> : null}
                  </div>
                </div>
                <div>
                  <Label htmlFor="planActive">Status</Label>
                  <Select id="planActive" value={plan.active} onChange={(event) => handlePlanChange('active', event.target.value)} disabled={!organizationWriteAllowed || savingPlan || deletingPlan}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" disabled={!organizationWriteAllowed || savingPlan || deletingPlan}>{savingPlan ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Create Plan'}</Button>
                  <Button type="button" variant="destructive" onClick={onPlanDelete} disabled={!organizationWriteAllowed || !editingPlanId || savingPlan || deletingPlan}>{deletingPlan ? 'Deleting...' : 'Delete Plan'}</Button>
                </div>
              </form>

              <DataTable
                columns={[
                  { label: 'Code', key: 'code' },
                  { label: 'Name', key: 'name' },
                  { label: 'Limits', key: (item) => `${item.deviceLimit ?? '-'} devices / ${item.fieldLimit ?? '-'} fields` },
                  { label: 'Monthly', key: (item) => item.priceMonthly ?? '0.00' },
                  { label: 'Status', key: (item) => item.active ? 'Active' : 'Inactive' },
                ]}
                rows={subscriptionPlans}
                getRowKey={(item) => item.id}
                selectedRowKey={editingPlanId}
                onRowClick={(item) => {
                  setEditingPlanId(item.id);
                  setPlan(planForm(item));
                  setPlanErrors({});
                  setFeedback({ type: '', text: '' });
                }}
                emptyMessage={loading ? 'Loading subscription plans...' : 'No subscription plans found.'}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Farms"
            subtitle={currentOrganization ? `Manage farms for ${currentOrganization.name}.` : 'Select an organization first.'}
            action={agroWriteAllowed ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingFarmId(''); setFarm(EMPTY_FARM); setFarmErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for farms.' }); }} disabled={!selectedOrganizationId || savingFarm || deletingFarm}>New Farm</Button>
            ) : null}
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
              {agroWriteAllowed ? (
                <Button type="button" variant="secondary" onClick={() => { setEditingFieldId(''); setField(emptyField(selectedFarmId || farms[0]?.id || '')); setFieldErrors({}); setFeedback({ type: 'info', text: 'Create mode enabled for fields.' }); }} disabled={!selectedOrganizationId || !farms.length || savingField || deletingField}>New Field</Button>
              ) : null}
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
