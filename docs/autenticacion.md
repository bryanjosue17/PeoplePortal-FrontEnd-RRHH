# Autenticación — FrontEnd RRHH

## Mecanismo: ROPC directo a Keycloak + verificación de roles

El panel RRHH utiliza un formulario de login propio (React) con el flujo **Resource Owner Password Credentials (ROPC)**. Los roles se verifican desde el JWT parseado, no mediante `useKeycloak()`.

```mermaid
sequenceDiagram
    participant U as Usuario RRHH (Browser)
    participant Login as LoginPage (React)
    participant Auth as AuthContext
    participant KC as Keycloak Token Endpoint
    participant PR as ProtectedRoute

    U->>Login: Introduce usuario y contraseña
    Login->>Auth: auth.login(username, password)
    Auth->>KC: POST /realms/peopleportal/protocol/openid-connect/token
    Note right of KC: grant_type=password<br/>client_id=peopleportal-frontend
    KC-->>Auth: { access_token, refresh_token }
    Auth->>Auth: applyTokensToKeycloak(tokenData)
    Auth->>U: isAuthenticated = true
    U->>PR: Accede a ruta protegida
    PR->>PR: Extrae roles de auth.user.realm_access.roles
    alt Tiene rol hr o admin
        PR->>U: Render de la página
    else Sin rol
        PR->>U: Redirect a /access-denied
    end
```

---

## Configuración `keycloak.js`

`keycloak.js` crea un objeto `Keycloak` como **proxy de token** para el interceptor Axios. **No se llama a `keycloak.init()`** — los tokens se inyectan manualmente desde `AuthContext`.

```js
// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url:      import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:30080',
  realm:    'peopleportal',
  clientId: 'peopleportal-frontend',
});

export default keycloak;
```

---

## ProtectedRoute (`components/ProtectedRoute.jsx`)

```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ALLOWED_ROLES = ['hr', 'admin'];

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <CircularProgress />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = user?.realm_access?.roles ?? [];
  const hasAccess = ALLOWED_ROLES.some(r => roles.includes(r));

  if (!hasAccess) return <Navigate to="/access-denied" replace />;
  return children;
}
```

---

## Pantalla AccessDenied

Mostrada cuando el usuario autenticado no tiene los roles `hr` o `admin`.

---

## Interceptor Axios

```js
client.interceptors.request.use((config) => {
  if (keycloak.token) config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
```

---

## Almacenamiento del token

| Item | Valor |
|---|---|
| Clave access_token | `pp-rrhh-token` (sessionStorage) |
| Clave refresh_token | `pp-rrhh-refresh` (sessionStorage) |
| Scope | Session (se limpia al cerrar pestaña) |
| Refresh automático | `AuthContext` refresca antes de que expire |

---

## Realm y client de Keycloak

| Parámetro | Valor |
|---|---|
| Realm | `peopleportal` |
| Client ID | `peopleportal-frontend` |
| Client type | Public (sin secret) |
| Grant type | **Resource Owner Password Credentials (ROPC)** |
| Roles requeridos | `hr` o `admin` |

```js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url:      import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm:    'peopleportal',
  clientId: 'peopleportal-frontend',
});

export default keycloak;
```

---

## ProtectedRoute (`components/ProtectedRoute.jsx`)

```jsx
import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';

const ALLOWED_ROLES = ['hr', 'admin'];

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <CircularProgress />;

  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  const roles = keycloak.tokenParsed?.realm_access?.roles ?? [];
  const hasAccess = ALLOWED_ROLES.some(r => roles.includes(r));

  if (!hasAccess) return <Navigate to="/access-denied" replace />;

  return children;
}
```

---

## Pantalla AccessDenied

Mostrada cuando el usuario autenticado no tiene los roles `hr` o `admin`.

Contenido:
- Mensaje explicativo del error de acceso
- Link al Portal Colaborador (`http://localhost:30081`)
- Botón para cerrar sesión (`keycloak.logout()`)

---

## Interceptor Axios

```js
client.interceptors.request.use((config) => {
  const token = keycloak.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Realm y client de Keycloak

| Parámetro | Valor |
|---|---|
| Realm | `peopleportal` |
| Client ID | `peopleportal-frontend` |
| Client type | Public (sin secret) |
| Grant type | Authorization Code + PKCE S256 |
| Roles requeridos | `hr` o `admin` |
