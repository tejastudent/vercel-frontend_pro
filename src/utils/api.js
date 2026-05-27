import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('advisor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('advisor_token');
      localStorage.removeItem('advisor_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Clients
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  submitRiskQuestionnaire: (id, data) => api.post(`/clients/${id}/risk-questionnaire`, data)
};

// Portfolios
export const portfoliosAPI = {
  get: (clientId) => api.get(`/portfolios/${clientId}`),
  addHolding: (clientId, data) => api.post(`/portfolios/${clientId}/holdings`, data),
  updateHolding: (clientId, holdingId, data) => api.put(`/portfolios/${clientId}/holdings/${holdingId}`, data),
  removeHolding: (clientId, holdingId) => api.delete(`/portfolios/${clientId}/holdings/${holdingId}`),
  refreshPrices: (clientId) => api.post(`/portfolios/${clientId}/refresh`)
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  markRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch('/alerts/read-all'),
  delete: (id) => api.delete(`/alerts/${id}`)
};

// AI Chat
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getSessions: () => api.get('/chat/sessions'),
  getSession: (sessionId) => api.get(`/chat/sessions/${sessionId}`),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`)
};

// Market
export const marketAPI = {
  getOverview: () => api.get('/market/overview'),
  getHistory: (symbol, days) => api.get(`/market/history/${symbol}`, { params: { days } })
};

// Documents (RAG)
export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  search: (query) => api.post('/documents/search', { query }),
  getStatus: () => api.get('/documents/status')
};

// Recommendations
export const recommendationsAPI = {
  getForClient: (clientId) => api.get(`/recommendations/${clientId}`)
};

export default api;
