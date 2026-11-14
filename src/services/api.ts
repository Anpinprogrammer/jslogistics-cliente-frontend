import axios from 'axios';
import { BASE } from '../api/http';
import { AuthResponse, CreateOrderPayload, FinanceSummary, Order, Transaction, User } from '../types';

/*
 * API anterior de este repo, que solo usan Registro y Rastreo (páginas de la landing).
 * El portal del cliente usa src/api/. La sesión ahora va en una cookie httpOnly: nada de tokens en localStorage.
 */
const api = axios.create({ baseURL: BASE, withCredentials: true, headers: { 'X-JSL': '1' } });

// Bubble up error messages cleanly
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Error de conexión';
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get<User>('/auth/me').then(r => r.data),
};

export const ordersAPI = {
  getAll: () => api.get<Order[]>('/orders').then(r => r.data),
  getById: (id: string) => api.get<Order>(`/orders/${id}`).then(r => r.data),
  create: (payload: CreateOrderPayload) => api.post<Order>('/orders', payload).then(r => r.data),
};

export const financeAPI = {
  summary: () => api.get<FinanceSummary>('/finance/summary').then(r => r.data),
  transactions: () => api.get<Transaction[]>('/finance/transactions').then(r => r.data),
  registerPayment: (amount: number, reference: string) =>
    api.post('/finance/payment', { amount, reference }).then(r => r.data),
};

export default api;
