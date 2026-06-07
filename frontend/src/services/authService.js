import api from './api';

/**
 * Auth service — Phase 2 will implement these fully.
 * Stubs defined here so imports don't break during Phase 1.
 */

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  changePassword: (data) => api.post('/auth/change-password', data),
};
