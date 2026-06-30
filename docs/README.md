# FrontEnd RRHH — Documentación

## Stack

| Componente | Tecnología |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| UI Library | MUI v9 (Material UI) |
| Autenticación | Keycloak-js + @react-keycloak/web (PKCE S256) |
| HTTP client | Axios con interceptor Bearer token |
| Router | React Router v7 |
| Tests | Vitest + @testing-library/react |
| Linter | oxlint |

## Páginas implementadas

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `Dashboard.jsx` | KPIs globales: empleados, solicitudes pendientes, documentos, comunicados |
| `/employees` | `Employees.jsx` | Listado de empleados con búsqueda y creación |
| `/employees/:id` | `EmployeeDetail.jsx` | Detalle completo del empleado |
| `/documents` | `Documents.jsx` | Gestión de documentos de todos los colaboradores |
| `/requests` | `Requests.jsx` | Gestión de solicitudes con filtros y aprobación/rechazo |
| `/announcements` | `Announcements.jsx` | Publicar y administrar comunicados internos |
| `/benefits` | `Benefits.jsx` | Catálogo de beneficios corporativos |

## API endpoints consumidos

```
GET   /api/dashboard             → KPIs del panel RRHH (Dashboard)
GET   /api/hr/employees          → Listado de empleados (Employees)
GET   /api/hr/employees/:id      → Detalle de empleado (EmployeeDetail)
POST  /api/hr/employees          → Crear empleado (Employees)
PUT   /api/hr/employees/:id      → Actualizar empleado (EmployeeDetail)
GET   /api/hr/requests           → Todas las solicitudes (Requests)
PATCH /api/hr/requests/:id/status → Aprobar/rechazar solicitud (Requests)
GET   /api/hr/documents          → Todos los documentos (Documents)
POST  /api/hr/documents          → Subir documento (Documents)
PATCH /api/hr/documents/:id/status → Actualizar estado documento
GET   /api/announcements         → Comunicados activos (Announcements)
GET   /api/benefits              → Catálogo de beneficios (Benefits)
```

## Autenticación

- SSO con Keycloak via PKCE Authorization Code Flow (S256)
- Token almacenado en `sessionStorage` bajo la clave `keycloak-token`
- Interceptor Axios inyecta `Authorization: Bearer <token>` en todos los requests
- Realm: `peopleportal` | Client: `peopleportal-frontend`
- Rol esperado: `hr` o `admin`

## Configuración de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | Base URL de la API (vacío = misma origin) | `""` |
| `VITE_KEYCLOAK_URL` | URL del servidor Keycloak | `http://localhost:8080` |

## Proxy nginx (K8s)

Las llamadas a `/api/` son interceptadas por nginx y redirigidas al servicio interno de la API:
```nginx
location /api/ {
    proxy_pass http://peopleportal-api-service:80;
}
```

## Kubernetes

Manifiesto: `k8s/frontend-rrhh.yaml`
- Deployment: imagen `peopleportal-frontend-rrhh:latest` (`imagePullPolicy: Never`)
- Service: NodePort `:30082`
- URL local: `http://localhost:30082`

## Comandos

```bash
# Desarrollo
npm run dev

# Tests
npm test

# Build producción
npm run build

# Lint
npm run lint

# Build imagen Docker
docker build -t peopleportal-frontend-rrhh:latest .
```
