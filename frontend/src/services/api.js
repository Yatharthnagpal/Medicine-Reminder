import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout — Render free tier can be slow on cold start
});

// Retry logic for Render free-tier cold starts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry once on network errors or 5xx (cold start)
    if (
      !config._retried &&
      (!error.response || error.response.status >= 500)
    ) {
      config._retried = true;
      // Wait 3 seconds before retrying (give Render time to wake up)
      await new Promise((r) => setTimeout(r, 3000));
      return api(config);
    }
    return Promise.reject(error);
  }
);

// --- Reminders ---

export const getReminders = async () => {
  const response = await api.get('/reminders');
  return response.data;
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

// --- Dashboard ---

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export default api;

