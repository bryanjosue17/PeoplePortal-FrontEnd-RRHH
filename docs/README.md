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
| `/benefits` | `Benefits.jsx` | Catálogo de beneficios con CRUD (crear, editar, desactivar) |
| `/reports` | `Reports.jsx` | Reportes con tablas dinámicas + exportación PDF via @react-pdf/renderer |

## API endpoints consumidos

```
GET   /api/dashboard               → KPIs del panel RRHH (Dashboard)
GET   /api/hr/employees            → Listado de empleados (Employees)
GET   /api/hr/employees/:id        → Detalle de empleado (EmployeeDetail)
POST  /api/hr/employees            → Crear empleado (Employees)
PUT   /api/hr/employees/:id        → Actualizar empleado (EmployeeDetail)
GET   /api/hr/requests             → Todas las solicitudes (Requests)
PATCH /api/hr/requests/:id/status  → Aprobar/rechazar solicitud (Requests)
GET   /api/hr/documents            → Todos los documentos (Documents)
POST  /api/hr/documents            → Subir documento (Documents)
PATCH /api/hr/documents/:id/status → Actualizar estado documento
GET   /api/announcements           → Comunicados activos (Announcements)
GET   /api/benefits                → Catálogo de beneficios (Benefits)
GET   /api/hr/benefits             → Todos los beneficios (Benefits CRUD)
POST  /api/hr/benefits             → Crear beneficio (Benefits)
PUT   /api/hr/benefits/:id         → Actualizar beneficio (Benefits)
DELETE /api/hr/benefits/:id        → Desactivar beneficio (Benefits)
GET   /api/hr/reports/requests-by-status  → Reporte: solicitudes por estado (Reports)
GET   /api/hr/reports/requests-by-type    → Reporte: solicitudes por tipo (Reports)
GET   /api/hr/reports/requests-over-time  → Reporte: solicitudes en el tiempo (Reports)
GET   /api/hr/reports/active-employees    → Reporte: empleados activos (Reports)
GET   /api/hr/reports/pending-documents   → Reporte: documentos pendientes (Reports)
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

## CI/CD

Pipeline en `.github/workflows/ci.yml`:

1. `build-test`: npm ci → lint → `npm run test:coverage` (reporta a Codacy) → build
2. `docker`: build + push imagen a GHCR (`peopleportal-frontend-rrhh`)

## Comandos

```bash
# Desarrollo
npm run dev

# Tests
npm test

# Tests con cobertura (Codacy)
npm run test:coverage

# Build producción
npm run build

# Lint
npm run lint

# Build imagen Docker
docker build -t peopleportal-frontend-rrhh:latest .

# Dependencias extra
npm install @react-pdf/renderer
```
