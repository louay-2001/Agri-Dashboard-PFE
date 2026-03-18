import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      console.log('---------------- API REQUEST ----------------');
      console.log('Request URL:', `${config.baseURL}${config.url}`);
      console.log('Method:', config.method);
      console.log('Token from localStorage:', token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('Final headers:', config.headers);
      console.log('--------------------------------------------');
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
    console.log('Calling signup endpoint...');
    const response = await api.post('/auth/signup', data);
    console.log('Signup success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL SIGNUP ERROR:', error);
    console.error('signup error.message =', error?.message);
    console.error('signup error.code =', error?.code);
    console.error('signup error.response =', error?.response);
    console.error('signup error.request =', error?.request);
    throw error;
  }
};

export const signin = async (data) => {
  try {
    console.log('Calling signin endpoint...');
    const response = await api.post('/auth/signin', data);
    console.log('Signin success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL SIGNIN ERROR:', error);
    console.error('signin error.message =', error?.message);
    console.error('signin error.code =', error?.code);
    console.error('signin error.response =', error?.response);
    console.error('signin error.request =', error?.request);
    throw error;
  }
};

// --- Alerts API ---
export const getAllAlerts = async () => {
  try {
    console.log('Calling alerts endpoint...');
    console.log('Token before alerts call =', typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const response = await api.get('/api/alerts/all');

    console.log('Alerts success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL ALERTS ERROR:', error);
    console.error('alerts error.message =', error?.message);
    console.error('alerts error.code =', error?.code);
    console.error('alerts error.response =', error?.response);
    console.error('alerts error.response.data =', error?.response?.data);
    console.error('alerts error.response.status =', error?.response?.status);
    console.error('alerts error.request =', error?.request);
    throw error;
  }
};

// --- Gateway API ---
export const getAllGateways = async () => {
  try {
    console.log('Calling gateways endpoint...');
    const response = await api.get('/api/gateways');
    console.log('Gateways success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL GATEWAYS ERROR:', error);
    console.error('gateways error.message =', error?.message);
    console.error('gateways error.code =', error?.code);
    console.error('gateways error.response =', error?.response);
    console.error('gateways error.response.data =', error?.response?.data);
    console.error('gateways error.response.status =', error?.response?.status);
    console.error('gateways error.request =', error?.request);
    throw error;
  }
};

export const getGateway = async (id) => {
  try {
    const response = await api.get(`/api/gateways/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL GET GATEWAY ERROR ${id}:`, error);
    console.error('gateway error.message =', error?.message);
    console.error('gateway error.code =', error?.code);
    console.error('gateway error.response =', error?.response);
    throw error;
  }
};

export const editGateway = async (id, data) => {
  try {
    const response = await api.put(`/api/gateways/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`FULL EDIT GATEWAY ERROR ${id}:`, error);
    console.error('edit gateway error.message =', error?.message);
    console.error('edit gateway error.code =', error?.code);
    console.error('edit gateway error.response =', error?.response);
    throw error;
  }
};

export const saveGateway = async (data) => {
  try {
    const response = data.gatewayId
      ? await api.put(`/api/gateways/${data.gatewayId}`, data)
      : await api.post('/api/gateways', data);
    return response.data;
  } catch (error) {
    console.error('FULL SAVE GATEWAY ERROR:', error);
    console.error('save gateway error.message =', error?.message);
    console.error('save gateway error.code =', error?.code);
    console.error('save gateway error.response =', error?.response);
    throw error;
  }
};

export const deleteGateway = async (id) => {
  try {
    const response = await api.delete(`/api/gateways/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL DELETE GATEWAY ERROR ${id}:`, error);
    console.error('delete gateway error.message =', error?.message);
    console.error('delete gateway error.code =', error?.code);
    console.error('delete gateway error.response =', error?.response);
    throw error;
  }
};

// --- Node API ---
export const getAllNodes = async () => {
  try {
    console.log('Calling nodes endpoint...');
    const response = await api.get('/api/nodes');
    console.log('Nodes success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL NODES ERROR:', error);
    console.error('nodes error.message =', error?.message);
    console.error('nodes error.code =', error?.code);
    console.error('nodes error.response =', error?.response);
    console.error('nodes error.response.data =', error?.response?.data);
    console.error('nodes error.response.status =', error?.response?.status);
    console.error('nodes error.request =', error?.request);
    throw error;
  }
};

export const getNode = async (id) => {
  try {
    const response = await api.get(`/api/nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL GET NODE ERROR ${id}:`, error);
    console.error('node error.message =', error?.message);
    console.error('node error.code =', error?.code);
    console.error('node error.response =', error?.response);
    throw error;
  }
};

export const saveNode = async (data) => {
  try {
    const response = data.id
      ? await api.put(`/api/nodes/${data.id}`, data)
      : await api.post('/api/nodes', data);
    return response.data;
  } catch (error) {
    console.error('FULL SAVE NODE ERROR:', error);
    console.error('save node error.message =', error?.message);
    console.error('save node error.code =', error?.code);
    console.error('save node error.response =', error?.response);
    throw error;
  }
};

export const deleteNode = async (id) => {
  try {
    const response = await api.delete(`/api/nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL DELETE NODE ERROR ${id}:`, error);
    console.error('delete node error.message =', error?.message);
    console.error('delete node error.code =', error?.code);
    console.error('delete node error.response =', error?.response);
    throw error;
  }
};

// --- Sensor API ---
export const getAllSensors = async () => {
  try {
    console.log('Calling sensors endpoint...');
    const response = await api.get('/api/sensors');
    console.log('Sensors success:', response);
    return response.data;
  } catch (error) {
    console.error('FULL SENSORS ERROR:', error);
    console.error('sensors error.message =', error?.message);
    console.error('sensors error.code =', error?.code);
    console.error('sensors error.response =', error?.response);
    console.error('sensors error.response.data =', error?.response?.data);
    console.error('sensors error.response.status =', error?.response?.status);
    console.error('sensors error.request =', error?.request);
    throw error;
  }
};

export const getSensor = async (id) => {
  try {
    const response = await api.get(`/api/sensors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL GET SENSOR ERROR ${id}:`, error);
    console.error('sensor error.message =', error?.message);
    console.error('sensor error.code =', error?.code);
    console.error('sensor error.response =', error?.response);
    throw error;
  }
};

export const saveSensor = async (data) => {
  try {
    const response = data.sensorId
      ? await api.put(`/api/sensors/${data.sensorId}`, data)
      : await api.post('/api/sensors', data);
    return response.data;
  } catch (error) {
    console.error('FULL SAVE SENSOR ERROR:', error);
    console.error('save sensor error.message =', error?.message);
    console.error('save sensor error.code =', error?.code);
    console.error('save sensor error.response =', error?.response);
    throw error;
  }
};

export const deleteSensor = async (id) => {
  try {
    const response = await api.delete(`/api/sensors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`FULL DELETE SENSOR ERROR ${id}:`, error);
    console.error('delete sensor error.message =', error?.message);
    console.error('delete sensor error.code =', error?.code);
    console.error('delete sensor error.response =', error?.response);
    throw error;
  }
};

export default api;