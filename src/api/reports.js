import apiClient from './client';

export const getRequestsByStatus = () => apiClient.get('/api/hr/reports/requests-by-status');

export const getRequestsByType = () => apiClient.get('/api/hr/reports/requests-by-type');

export const getRequestsOverTime = () => apiClient.get('/api/hr/reports/requests-over-time');

export const getActiveEmployees = () => apiClient.get('/api/hr/reports/active-employees');

export const getPendingDocuments = () => apiClient.get('/api/hr/reports/pending-documents');
