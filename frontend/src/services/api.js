import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout — Render free tier can be very slow on cold start
});

// Retry logic for Render free-tier cold starts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Retry up to 2 times on network errors or 5xx (cold start)
    const retryCount = config._retryCount || 0;
    if (
      retryCount < 2 &&
      (!error.response || error.response.status >= 500)
    ) {
      config._retryCount = retryCount + 1;
      // Wait before retrying (give Render time to wake up)
      await new Promise((r) => setTimeout(r, 3000));
      return api(config);
    }
    return Promise.reject(error);
  }
);

// --- Reminders ---

export const getReminders = async () => {
  try {
    const response = await api.get('/reminders');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('getReminders failed:', err.message);
    throw err;
  }
};

export const getReminder = async (id) => {
  const response = await api.get(`/reminders/${id}`);
  return response.data;
};

export const createReminder = async (data) => {
  const response = await api.post('/reminders', data);
  return response.data;
};

export const updateReminder = async (id, data) => {
  const response = await api.put(`/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminders/${id}`);
  return response.data;
};

export const bulkUpdateMessages = async () => {
  const response = await api.post('/reminders/update-messages');
  return response.data;
};

// --- Dashboard ---

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data || { total: 0, pending: 0, sent: 0, failed: 0 };
  } catch (err) {
    console.error('getDashboardStats failed:', err.message);
    return { total: 0, pending: 0, sent: 0, failed: 0 };
  }
};

export default api;
