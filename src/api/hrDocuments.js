import apiClient from './client';

export const getAllDocuments = () => apiClient.get('/api/hr/documents');
export const uploadDocument = (data) => apiClient.post('/api/hr/documents', data);
export const updateDocumentStatus = (id, data) => apiClient.patch(`/api/hr/documents/${id}/status`, data);
