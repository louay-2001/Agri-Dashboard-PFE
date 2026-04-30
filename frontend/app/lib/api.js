import axios from 'axios';
import {
  buildLoginHref,
  clearAuthSession,
  getAccessToken,
  isProtectedAppRoute,
} from './auth';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

const DEFAULT_DEVICE_PAGE_PARAMS = {
  page: 0,
  size: 100,
};

const DEFAULT_READING_PAGE_PARAMS = {
  page: 0,
  size: 20,
};

const deprecatedWarnings = new Set();

export const DASHBOARD_DATA_UPDATED_EVENT = 'dashboard-data-updated';

export const dispatchDashboardDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DASHBOARD_DATA_UPDATED_EVENT));
  }
};

const formatValidationErrors = (validationErrors) => {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return '';
  }

  const messages = Object.entries(validationErrors)
    .filter(([, message]) => typeof message === 'string' && message.trim())
    .map(([field, message]) => `${field}: ${message.trim()}`);

  return messages.join(' | ');
};

export const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const validationMessage = formatValidationErrors(responseData?.validationErrors);

  if (validationMessage) {
    if (responseData?.message && responseData.message !== 'Validation failed') {
      return `${responseData.message}: ${validationMessage}`;
    }

    return validationMessage;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length) {
    return responseData.errors.join(' | ');
  }

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim();
  }

  return responseData?.message
    || responseData?.error
    || error?.message
    || fallbackMessage;
};

const warnDeprecated = (name, replacement) => {
  if (typeof window === 'undefined' || deprecatedWarnings.has(name)) {
    return;
  }

  deprecatedWarnings.add(name);
  const suffix = replacement ? ` Migrate to ${replacement}.` : '';
  console.warn(`[DEPRECATED] ${name} still targets the legacy gateway/node/sensor flow.${suffix}`);
};

const requestData = async (config) => {
  const response = await api(config);
  return response.data;
};

const normalizeReading = (reading) => {
  if (!reading || typeof reading !== 'object') {
    return reading;
  }

  return {
    ...reading,
    soilMoisture: reading.soilMoisture ?? reading.soil_moisture ?? null,
    batteryLevel: reading.batteryLevel ?? reading.battery_level ?? null,
  };
};

const normalizeReadingPage = (page) => {
  if (!page || typeof page !== 'object') {
    return page;
  }

  return {
    ...page,
    content: Array.isArray(page.content) ? page.content.map(normalizeReading) : [],
  };
};

const buildOrganizationParams = (organizationId, params = {}) => ({
  organizationId,
  ...params,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getAccessToken();

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      const requestUrl = String(error?.config?.url || '');
      const isAuthRequest = requestUrl.startsWith('/auth/');

      if (!isAuthRequest) {
        const currentPath = window.location.pathname || '';

        clearAuthSession();

        if (isProtectedAppRoute(currentPath)) {
          const loginHref = `${buildLoginHref(`${currentPath}${window.location.search || ''}`)}&reason=session-expired`;
          window.location.assign(loginHref);
        }
      }
    }

    return Promise.reject(error);
  }
);

// --- Auth API ---
export const signup = (data) => requestData({
  method: 'post',
  url: '/auth/signup',
  data,
});

export const signin = (data) => requestData({
  method: 'post',
  url: '/auth/signin',
  data,
});

// --- Organization API ---
export const getOrganizations = () => requestData({
  method: 'get',
  url: '/api/agro/organizations',
});

export const getPublicOrganizations = () => requestData({
  method: 'get',
  url: '/api/agro/organizations/public',
});

export const getOrganization = (id) => requestData({
  method: 'get',
  url: `/api/agro/organizations/${id}`,
});

export const createOrganization = (data) => requestData({
  method: 'post',
  url: '/api/agro/organizations',
  data,
});

export const updateOrganization = (id, data) => requestData({
  method: 'put',
  url: `/api/agro/organizations/${id}`,
  data,
});

export const deleteOrganization = (id) => requestData({
  method: 'delete',
  url: `/api/agro/organizations/${id}`,
});

// --- Subscription Plan API ---
export const getSubscriptionPlans = () => requestData({
  method: 'get',
  url: '/api/agro/subscription-plans',
});

export const getSubscriptionPlan = (id) => requestData({
  method: 'get',
  url: `/api/agro/subscription-plans/${id}`,
});

export const createSubscriptionPlan = (data) => requestData({
  method: 'post',
  url: '/api/agro/subscription-plans',
  data,
});

export const updateSubscriptionPlan = (id, data) => requestData({
  method: 'put',
  url: `/api/agro/subscription-plans/${id}`,
  data,
});

export const deleteSubscriptionPlan = (id) => requestData({
  method: 'delete',
  url: `/api/agro/subscription-plans/${id}`,
});

// --- Farm API ---
export const getFarms = (organizationId) => requestData({
  method: 'get',
  url: '/api/agro/farms',
  params: buildOrganizationParams(organizationId),
});

export const getFarm = (organizationId, id) => requestData({
  method: 'get',
  url: `/api/agro/farms/${id}`,
  params: buildOrganizationParams(organizationId),
});

export const createFarm = (data) => requestData({
  method: 'post',
  url: '/api/agro/farms',
  data,
});

export const updateFarm = (organizationId, id, data) => requestData({
  method: 'put',
  url: `/api/agro/farms/${id}`,
  params: buildOrganizationParams(organizationId),
  data,
});

export const deleteFarm = (organizationId, id) => requestData({
  method: 'delete',
  url: `/api/agro/farms/${id}`,
  params: buildOrganizationParams(organizationId),
});

// --- Field API ---
export const getFields = (organizationId, farmId) => requestData({
  method: 'get',
  url: '/api/agro/fields',
  params: buildOrganizationParams(organizationId, farmId ? { farmId } : {}),
});

export const getField = (organizationId, id) => requestData({
  method: 'get',
  url: `/api/agro/fields/${id}`,
  params: buildOrganizationParams(organizationId),
});

export const createField = (data) => requestData({
  method: 'post',
  url: '/api/agro/fields',
  data,
});

export const updateField = (organizationId, id, data) => requestData({
  method: 'put',
  url: `/api/agro/fields/${id}`,
  params: buildOrganizationParams(organizationId),
  data,
});

export const deleteField = (organizationId, id) => requestData({
  method: 'delete',
  url: `/api/agro/fields/${id}`,
  params: buildOrganizationParams(organizationId),
});

// --- Device API ---
export const getDevices = (organizationId, params = {}) => requestData({
  method: 'get',
  url: '/devices',
  params: buildOrganizationParams(organizationId, {
    ...DEFAULT_DEVICE_PAGE_PARAMS,
    ...params,
  }),
});

export const getDevicesByOrganization = getDevices;

export const getDevice = (organizationId, id) => requestData({
  method: 'get',
  url: `/devices/${id}`,
  params: buildOrganizationParams(organizationId),
});

export const createDevice = (data) => requestData({
  method: 'post',
  url: '/devices',
  data,
});

export const updateDevice = (organizationId, id, data) => requestData({
  method: 'put',
  url: `/devices/${id}`,
  params: buildOrganizationParams(organizationId),
  data,
});

export const deleteDevice = (organizationId, id) => requestData({
  method: 'delete',
  url: `/devices/${id}`,
  params: buildOrganizationParams(organizationId),
});

// --- Sensor Reading API ---
export const getReadings = async (organizationId, deviceId, params = {}) => normalizeReadingPage(await requestData({
  method: 'get',
  url: '/api/collection/readings',
  params: buildOrganizationParams(organizationId, {
    ...(deviceId ? { deviceId } : {}),
    ...DEFAULT_READING_PAGE_PARAMS,
    ...params,
  }),
}));

export const getReadingHistory = getReadings;

export const getLatestReading = async (organizationId, deviceId) => {
  try {
    return normalizeReading(await requestData({
      method: 'get',
      url: '/api/collection/readings/latest',
      params: buildOrganizationParams(organizationId, { deviceId }),
    }));
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

// --- Deprecated legacy monitoring compatibility ---
/** @deprecated Legacy monitoring helper retained only for compile compatibility. */
export const getAllAlerts = async () => {
  warnDeprecated('getAllAlerts', 'organization/farm/field/device/readings views');
  return requestData({
    method: 'get',
    url: '/api/alerts/all',
  });
};

/** @deprecated Legacy monitoring helper retained only for compile compatibility. */
export const acknowledgeAlert = async (id) => {
  warnDeprecated('acknowledgeAlert', 'organization/farm/field/device/readings views');
  return requestData({
    method: 'put',
    url: `/api/alerts/${id}/ack`,
  });
};

/** @deprecated Legacy monitoring helper retained only for compile compatibility. */
export const getDashboardSummary = async () => {
  warnDeprecated('getDashboardSummary', 'organization/farm/field/device/readings views');
  return requestData({
    method: 'get',
    url: '/api/dashboard/summary',
  });
};

/** @deprecated Legacy monitoring helper retained only for compile compatibility. */
export const getDashboardAnalytics = async () => {
  warnDeprecated('getDashboardAnalytics', 'organization/farm/field/device/readings views');
  return requestData({
    method: 'get',
    url: '/api/dashboard/analytics',
  });
};

/** @deprecated Legacy gateway helper retained only for compile compatibility. */
export const getAllGateways = async () => {
  warnDeprecated('getAllGateways', 'getOrganizations / getDevices');
  return requestData({
    method: 'get',
    url: '/api/gateways',
  });
};

/** @deprecated Legacy gateway helper retained only for compile compatibility. */
export const getGateway = async (id) => {
  warnDeprecated('getGateway', 'getOrganization / getDevice');
  return requestData({
    method: 'get',
    url: `/api/gateways/${id}`,
  });
};

/** @deprecated Legacy gateway helper retained only for compile compatibility. */
export const editGateway = async (id, data) => {
  warnDeprecated('editGateway', 'updateOrganization / updateDevice');
  return requestData({
    method: 'put',
    url: `/api/gateways/${id}`,
    data,
  });
};

/** @deprecated Legacy gateway helper retained only for compile compatibility. */
export const saveGateway = async (data, options = {}) => {
  warnDeprecated('saveGateway', 'createOrganization / createDevice');
  return requestData({
    method: options.isUpdate ? 'put' : 'post',
    url: options.isUpdate ? `/api/gateways/${data.id}` : '/api/gateways',
    data,
  });
};

/** @deprecated Legacy gateway helper retained only for compile compatibility. */
export const deleteGateway = async (id) => {
  warnDeprecated('deleteGateway', 'deleteOrganization / deleteDevice');
  return requestData({
    method: 'delete',
    url: `/api/gateways/${id}`,
  });
};

/** @deprecated Legacy node helper retained only for compile compatibility. */
export const getAllNodes = async () => {
  warnDeprecated('getAllNodes', 'getFields / getDevices');
  return requestData({
    method: 'get',
    url: '/api/nodes',
  });
};

/** @deprecated Legacy node helper retained only for compile compatibility. */
export const getNode = async (id) => {
  warnDeprecated('getNode', 'getField / getDevice');
  return requestData({
    method: 'get',
    url: `/api/nodes/${id}`,
  });
};

/** @deprecated Legacy node helper retained only for compile compatibility. */
export const saveNode = async (data, options = {}) => {
  warnDeprecated('saveNode', 'createField / createDevice');
  return requestData({
    method: options.isUpdate ? 'put' : 'post',
    url: options.isUpdate ? `/api/nodes/${data.id}` : '/api/nodes',
    data,
  });
};

/** @deprecated Legacy node helper retained only for compile compatibility. */
export const deleteNode = async (id) => {
  warnDeprecated('deleteNode', 'deleteField / deleteDevice');
  return requestData({
    method: 'delete',
    url: `/api/nodes/${id}`,
  });
};

/** @deprecated Legacy sensor helper retained only for compile compatibility. */
export const getAllSensors = async () => {
  warnDeprecated('getAllSensors', 'getReadings');
  return requestData({
    method: 'get',
    url: '/api/sensors',
  });
};

/** @deprecated Legacy sensor helper retained only for compile compatibility. */
export const getSensor = async (id) => {
  warnDeprecated('getSensor', 'getLatestReading / getReadings');
  return requestData({
    method: 'get',
    url: `/api/sensors/${id}`,
  });
};

/** @deprecated Legacy sensor helper retained only for compile compatibility. */
export const saveSensor = async (data, options = {}) => {
  warnDeprecated('saveSensor', 'MQTT ingestion plus read-only readings endpoints');
  return requestData({
    method: options.isUpdate ? 'put' : 'post',
    url: options.isUpdate ? `/api/sensors/${data.id}` : '/api/sensors',
    data,
  });
};

/** @deprecated Legacy sensor helper retained only for compile compatibility. */
export const deleteSensor = async (id) => {
  warnDeprecated('deleteSensor', 'MQTT ingestion plus read-only readings endpoints');
  return requestData({
    method: 'delete',
    url: `/api/sensors/${id}`,
  });
};

export default api;
