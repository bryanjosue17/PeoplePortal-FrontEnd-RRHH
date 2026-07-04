import apiClient from './client';

export const getUsers         = ()             => apiClient.get('/api/hr/users');
export const getRealmRoles    = ()             => apiClient.get('/api/hr/users/roles');
export const getUserRoles     = (id)           => apiClient.get(`/api/hr/users/${id}/roles`);
export const createUser       = (data)         => apiClient.post('/api/hr/users', data);
export const setUserEnabled   = (id, enabled)  => apiClient.patch(`/api/hr/users/${id}/enabled`, { enabled });
export const setUserRoles     = (id, roleNames)=> apiClient.put(`/api/hr/users/${id}/roles`, { roleNames });
export const resetPassword    = (id, data)     => apiClient.post(`/api/hr/users/${id}/reset-password`, data);
