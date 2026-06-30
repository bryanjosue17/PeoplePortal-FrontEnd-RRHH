import apiClient from './client';

export const getAllRequests = () => apiClient.get('/api/hr/requests');
export const updateRequestStatus = (id, data) => apiClient.patch(`/api/hr/requests/${id}/status`, data);
