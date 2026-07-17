import axios from 'axios';
import keycloak from '../keycloak';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
});

// Antes de cada request: refresca el token si expira en menos de 30 seg
apiClient.interceptors.request.use(async config => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
      sessionStorage.setItem('keycloak-token', keycloak.token);
    } catch {
      // Si no se puede refrescar, limpiar sesión y volver al login personalizado
      sessionStorage.clear();
      window.location.reload();
      return Promise.reject(new Error('Token refresh failed'));
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  } else {
    const token = sessionStorage.getItem('keycloak-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el API responde 401, intentar refrescar token una vez más y reintentar
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && keycloak.authenticated) {
      original._retry = true;
      try {
        await keycloak.updateToken(-1); // forzar refresh
        sessionStorage.setItem('keycloak-token', keycloak.token);
        original.headers.Authorization = `Bearer ${keycloak.token}`;
        return apiClient(original);
      } catch {
        sessionStorage.clear();
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
