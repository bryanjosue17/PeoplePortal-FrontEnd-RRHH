# PeoplePortal — Panel RRHH

Panel de administración de Recursos Humanos. Gestiona empleados, solicitudes, documentos, comunicados, beneficios y reportes.

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 + MUI v9 |
| Build | Vite 8 |
| Auth | AuthContext + ROPC (login propio → Keycloak token endpoint) + ProtectedRoute |
| HTTP | Axios + interceptor Bearer |
| PDF | @react-pdf/renderer |
| Test | Vitest + Testing Library |
| Lint | oxlint |

## Scripts

```bash
npm run dev           # Dev server → http://localhost:5174
npm run build         # Build producción
npm run test          # Tests (Vitest)
npm run test:coverage # Tests con reporte de cobertura (Codacy)
npm run lint          # oxlint
```

## Módulos del panel

| Módulo | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | KPIs globales del sistema |
| Empleados | `/employees` | Listado, creación y detalle de empleados |
| Documentos | `/documents` | Gestión de expedientes digitales |
| Solicitudes | `/requests` | Aprobar / rechazar solicitudes |
| Comunicados | `/announcements` | Publicar avisos internos |
| Beneficios | `/benefits` | CRUD de catálogo de beneficios |
| Nómina | `/nomina` | Registros de nómina + adjuntar archivos |
| Usuarios | `/users` | Gestión de cuentas Keycloak (roles, reset-pw) |
| Reportes | `/reports` | Reportes dinámicos + exportación PDF |

## Acceso

Solo usuarios con rol **`hr`** o **`admin`** en Keycloak tienen acceso. Usuarios sin rol son redirigidos a la pantalla `/access-denied`.

## Despliegue

- **Docker/GHCR**: `ghcr.io/bryanjosue17/peopleportal-frontend-rrhh:main` (publicado por CI)
- **K8s**: NodePort `:30082` — `http://localhost:30082` — `imagePullPolicy: Always` + `imagePullSecrets: ghcr-secret`
- **Nginx**: proxy `/api/` → `peopleportal-api-service:80`

## Documentación técnica

Ver [`docs/`](./docs/README.md) para documentación detallada de arquitectura, autenticación, endpoints y despliegue.
