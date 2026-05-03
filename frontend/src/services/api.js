import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
