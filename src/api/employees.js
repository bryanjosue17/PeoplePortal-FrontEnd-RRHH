import apiClient from './client';

export const getAllEmployees = () => apiClient.get('/api/hr/employees');
export const getEmployeeById = (id) => apiClient.get(`/api/hr/employees/${id}`);
export const createEmployee = (data) => apiClient.post('/api/hr/employees', data);
export const updateEmployee = (id, data) => apiClient.put(`/api/hr/employees/${id}`, data);
