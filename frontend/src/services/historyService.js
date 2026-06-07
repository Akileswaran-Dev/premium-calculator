import api from './api';

export const historyService = {
  getHistory: (params = {}) => api.get('/history', { params }),
  getEntry: (id) => api.get(`/history/${id}`),
  updateEntry: (id, data) => api.patch(`/history/${id}`, data),
  deleteEntry: (id) => api.delete(`/history/${id}`),
  bulkDelete: (ids) => api.delete('/history/bulk', { data: { ids } }),
  deleteAll: () => api.delete('/history/all'),
  export: (format = 'csv') =>
    api.get('/history/export', {
      params: { format },
      responseType: 'blob',
    }),
};
