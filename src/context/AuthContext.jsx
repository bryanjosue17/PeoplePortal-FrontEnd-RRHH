/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import keycloak from '../keycloak';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'pp-rrhh-token';
const REFRESH_KEY = 'pp-rrhh-refresh';

/**
 * Llama al endpoint de token de Keycloak con usuario y contraseña
 * (Resource Owner Password Credentials Grant)
 */
async function requestToken(username, password) {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:30080';
  const realm = 'peopleportal';
  const clientId = 'peopleportal-frontend';
  const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'password',
    username,
    password,
    scope: 'openid profile email',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error_description || data.error || 'Credenciales inválidas';
    throw new Error(msg);
  }

  return res.json(); // { access_token, refresh_token, expires_in, ... }
}

/**
 * Usa el refresh_token para obtener nuevos tokens
 */
async function refreshTokenRequest(refreshToken) {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:30080';
  const realm = 'peopleportal';
  const clientId = 'peopleportal-frontend';
  const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Session expired');
  return res.json();
}

/**
 * Extrae el payload del JWT sin verificar (client-side)
 */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/**
 * Establece los tokens en el objeto keycloak-js para que el api/client.js
 * siga funcionando exactamente igual que antes.
 */
function applyTokensToKeycloak(tokenData) {
  keycloak.token = tokenData.access_token;
  keycloak.refreshToken = tokenData.refresh_token;
  keycloak.idToken = tokenData.id_token;
  keycloak.authenticated = true;
  keycloak.tokenParsed = parseJwt(tokenData.access_token);
  keycloak.realm_access = keycloak.tokenParsed?.realm_access;

  // Sobreescribir updateToken para que use nuestro refreshTokenRequest
  keycloak.updateToken = async (minValidity) => {
    const parsed = parseJwt(keycloak.token);
    if (!parsed) throw new Error('Invalid token');
    const expiresIn = parsed.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > (minValidity || 30)) return false; // no necesita refresh

    const data = await refreshTokenRequest(keycloak.refreshToken);
    keycloak.token = data.access_token;
    keycloak.refreshToken = data.refresh_token;
    keycloak.tokenParsed = parseJwt(data.access_token);
    sessionStorage.setItem(STORAGE_KEY, data.access_token);
    sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
    return true;
  };

  // Sobreescribir logout
  const originalLogout = keycloak.logout?.bind(keycloak);
  keycloak.logout = (opts) => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    keycloak.token = null;
    keycloak.authenticated = false;
    keycloak.tokenParsed = null;
    if (originalLogout && typeof originalLogout === 'function') {
      try { originalLogout(opts); } catch { /* no-op */ }
    }
    window.location.reload();
  };
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const scheduleRefresh = useCallback((expiresIn) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Refrescar 60 segundos antes de que expire
    const delay = Math.max((expiresIn - 60) * 1000, 10_000);
    refreshTimerRef.current = setTimeout(async () => {
      const rt = sessionStorage.getItem(REFRESH_KEY);
      if (!rt) return;
      try {
        const data = await refreshTokenRequest(rt);
        applyTokensToKeycloak(data);
        sessionStorage.setItem(STORAGE_KEY, data.access_token);
        sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
        const parsed = parseJwt(data.access_token);
        const exIn = parsed?.exp - Math.floor(Date.now() / 1000);
        scheduleRefresh(exIn);
      } catch {
        // Sesión expirada, limpiar
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        setIsAuthenticated(false);
        setUser(null);
      }
    }, delay);
  }, []);

  // Restaurar sesión desde sessionStorage al cargar
  useEffect(() => {
    const savedToken = sessionStorage.getItem(STORAGE_KEY);
    const savedRefresh = sessionStorage.getItem(REFRESH_KEY);
    if (savedToken && savedRefresh) {
      const parsed = parseJwt(savedToken);
      const now = Math.floor(Date.now() / 1000);
      if (parsed && parsed.exp > now) {
        applyTokensToKeycloak({ access_token: savedToken, refresh_token: savedRefresh });
        setUser(parsed);
        setIsAuthenticated(true);
        scheduleRefresh(parsed.exp - now);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
      }
    }
    setLoading(false);
  }, [scheduleRefresh]);

  const login = useCallback(async (username, password) => {
    const data = await requestToken(username, password);
    applyTokensToKeycloak(data);
    sessionStorage.setItem(STORAGE_KEY, data.access_token);
    sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
    const parsed = parseJwt(data.access_token);
    setUser(parsed);
    setIsAuthenticated(true);
    scheduleRefresh(data.expires_in);
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    keycloak.token = null;
    keycloak.refreshToken = null;
    keycloak.authenticated = false;
    keycloak.tokenParsed = null;
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
