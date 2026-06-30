import apiClient from './client';

export const getActiveAnnouncements = () => apiClient.get('/api/announcements');
export const createAnnouncement = (data) => apiClient.post('/api/hr/announcements', data);
