import apiClient from './client';

export const getAllVouchers    = ()         => apiClient.get('/api/hr/vouchers');
export const createVoucherFor  = (data)     => apiClient.post('/api/hr/vouchers', data);
export const uploadVoucherFile = (id, data) => apiClient.patch(`/api/hr/vouchers/${id}/upload`, data);
