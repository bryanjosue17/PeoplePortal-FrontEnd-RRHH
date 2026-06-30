import apiClient from './client';

export const getAllBenefits = () => apiClient.get('/api/hr/benefits');

export const createBenefit = (data) => apiClient.post('/api/hr/benefits', data);

export const updateBenefit = (id, data) => apiClient.put(`/api/hr/benefits/${id}`, data);

export const deactivateBenefit = (id) => apiClient.delete(`/api/hr/benefits/${id}`);
