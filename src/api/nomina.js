import apiClient from './client';

export const getAllNomina     = ()         => apiClient.get('/api/hr/nomina');
export const createNomina     = (data)     => apiClient.post('/api/hr/nomina', data);
export const uploadNominaFile = (id, data) => apiClient.patch(`/api/hr/nomina/${id}/upload`, data);
