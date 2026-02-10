import axios from 'axios';
import { AuthResponse, CreateOrderPayload, FinanceSummary, Order, Transaction, User } from '../types';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE });

// Attach JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('jsl_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Bubble up error messages cleanly
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Error de conexión';
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
  register: (payload: Omit<User, 'id' | 'balance' | 'creditLimit' | 'createdAt' | 'role' | 'active'> & { password: string }) =>
    api.post<AuthResponse>('/auth/register', payload).then(r => r.data),
  me: () => api.get<User>('/auth/me').then(r => r.data),
};

export const ordersAPI = {
  getAll: () => api.get<Order[]>('/orders').then(r => r.data),
  getById: (id: string) => api.get<Order>(`/orders/${id}`).then(r => r.data),
  create: (payload: CreateOrderPayload) => api.post<Order>('/orders', payload).then(r => r.data),
  track: (trackingNumber: string) => api.get<Order>(`/track/${trackingNumber}`).then(r => r.data),
};

export const financeAPI = {
  summary: () => api.get<FinanceSummary>('/finance/summary').then(r => r.data),
  transactions: () => api.get<Transaction[]>('/finance/transactions').then(r => r.data),
  registerPayment: (amount: number, reference: string) =>
    api.post('/finance/payment', { amount, reference }).then(r => r.data),
};

export default api;
