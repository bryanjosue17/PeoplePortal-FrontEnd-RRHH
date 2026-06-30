import apiClient from './client';

export const getAllBenefits = () => apiClient.get('/api/benefits');
