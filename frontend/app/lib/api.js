import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

export const DASHBOARD_DATA_UPDATED_EVENT = 'dashboard-data-updated';

export const dispatchDashboardDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DASHBOARD_DATA_UPDATED_EVENT));
  }
};

export const getApiErrorMessage = (error, fallbackMessage) => (
  error?.response?.data?.message
  || error?.response?.data?.error
  || error?.message
  || fallbackMessage
);

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
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

// --- Auth API ---
export const signup = async (data) => {
  try {
    const response = await api.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signin = async (data) => {
  try {
    const response = await api.post('/auth/signin', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Alerts API ---
export const getAllAlerts = async () => {
  try {
    const response = await api.get('/api/alerts/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acknowledgeAlert = async (id) => {
  try {
    const response = await api.put(`/api/alerts/${id}/ack`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardAnalytics = async () => {
  try {
    const response = await api.get('/api/dashboard/analytics');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Gateway API ---
export const getAllGateways = async () => {
  try {
    const response = await api.get('/api/gateways');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGateway = async (id) => {
  try {
    const response = await api.get(`/api/gateways/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editGateway = async (id, data) => {
  try {
    const response = await api.put(`/api/gateways/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveGateway = async (data, options = {}) => {
  try {
    const response = options.isUpdate
      ? await api.put(`/api/gateways/${data.id}`, data)
      : await api.post('/api/gateways', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteGateway = async (id) => {
  try {
    const response = await api.delete(`/api/gateways/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Node API ---
export const getAllNodes = async () => {
  try {
    const response = await api.get('/api/nodes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNode = async (id) => {
  try {
    const response = await api.get(`/api/nodes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveNode = async (data, options = {}) => {
  try {
    const response = options.isUpdate
      ? await api.put(`/api/nodes/${data.id}`, data)
      : await api.post('/api/nodes', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNode = async (id) => {
  try {
    const response = await api.delete(`/api/nodes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Sensor API ---
export const getAllSensors = async () => {
  try {
    const response = await api.get('/api/sensors');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSensor = async (id) => {
  try {
    const response = await api.get(`/api/sensors/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveSensor = async (data, options = {}) => {
  try {
    const response = options.isUpdate
      ? await api.put(`/api/sensors/${data.id}`, data)
      : await api.post('/api/sensors', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSensor = async (id) => {
  try {
    const response = await api.delete(`/api/sensors/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
