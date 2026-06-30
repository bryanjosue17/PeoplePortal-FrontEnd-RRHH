# PeoplePortal — FrontEnd RRHH

Panel de administración de Recursos Humanos. Gestiona empleados, documentos, solicitudes y comunicados.

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + MUI 9 |
| Build | Vite 8 |
| Auth | Keycloak (PKCE S256) |
| HTTP | Axios |
| Test | Vitest + Testing Library |
| Lint | Oxlint |

## Scripts

```bash
npm run dev      # Dev server (localhost:5174)
npm run build    # Build producción
npm run preview  # Preview build
npm run lint     # Oxlint
npm run test     # Tests (vitest run)
npm run test:watch  # Tests en modo watch
```

## Estructura

```
src/
  api/            # Clientes HTTP (axios)
  components/     # Componentes compartidos (Layout)
  pages/          # Páginas (Dashboard, Employees, EmployeeDetail, Documents, Requests, Announcements)
  test/           # Tests unitarios
  theme/          # Tema MUI
  keycloak.js     # Config Keycloak
  App.jsx         # Router + Providers
  main.jsx        # Entry point
```

## Tests

Ubicados en `src/test/`:

| Archivo | Sujetos | Tests |
|---------|---------|-------|
| `keycloak.test.js` | Configuración Keycloak | 3 |
| `client.test.js` | Axios instance + interceptors | 5 |
| `Layout.test.jsx` | Navegación, usuario, children | 6 |
| `Dashboard.test.jsx` | Estados loading/error/data | 4 |

## Variables de entorno

| Variable | Defecto | Descripción |
|----------|---------|-------------|
| `VITE_KEYCLOAK_URL` | `http://localhost:8080` | URL del servidor Keycloak |
| `VITE_API_URL` | `''` (relativo) | URL base de la API |

## Despliegue

- **Docker**: `Dockerfile` multi-stage (node build + nginx:alpine)
- **K8s**: `deploy/k8s/frontend-rrhh.yaml` (NodePort 30082)
- **Nginx**: Proxy `/api/` → `peopleportal-api-service:80`
