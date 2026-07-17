# Endpoints Consumidos — FrontEnd RRHH

Todos los endpoints se invocan vía `client.js` (Axios + interceptor Bearer).  
Base URL: configurada por `VITE_API_URL` (vacío = misma origin).

---

## Dashboard RRHH

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/dashboard` | Dashboard | KPIs globales: empleados, solicitudes, documentos, comunicados |

---

## Empleados

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/hr/employees` | Employees | Listar todos los empleados |
| `GET` | `/api/hr/employees/:id` | EmployeeDetail | Detalle completo de un empleado |
| `POST` | `/api/hr/employees` | Employees | Crear nuevo empleado |
| `PUT` | `/api/hr/employees/:id` | EmployeeDetail | Actualizar datos del empleado |

---

## Solicitudes

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/hr/requests` | Requests | Listar todas las solicitudes con filtros (tipo, estado) |
| `PATCH` | `/api/hr/requests/:id/status` | Requests | Aprobar o rechazar solicitud (acepta campo `hrComment`) |

---

## Documentos

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/hr/documents` | Documents | Listar todos los documentos de todos los colaboradores |
| `POST` | `/api/hr/documents` | Documents | Subir documento al expediente de un empleado |
| `PATCH` | `/api/hr/documents/:id/status` | Documents | Actualizar estado de un documento |

---

## Comunicados

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/announcements` | Announcements | Comunicados activos |
| `POST` | `/api/hr/announcements` | Announcements | Publicar nuevo comunicado |
| `PATCH` | `/api/hr/announcements/:id/deactivate` | Announcements | Desactivar comunicado |

---

## Nómina

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/hr/nomina` | Nomina | Listar todos los registros de nómina |
| `POST` | `/api/hr/nomina` | Nomina | Crear registro de nómina para un empleado (período + tipo) |
| `PATCH` | `/api/hr/nomina/:id/upload` | Nomina | Adjuntar URL de archivo al registro de nómina |

---

## Beneficios (CRUD completo)

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/benefits` | Benefits | Catálogo de beneficios activos |
| `GET` | `/api/hr/benefits` | Benefits | Todos los beneficios (incluso inactivos) |
| `POST` | `/api/hr/benefits` | Benefits | Crear beneficio |
| `PUT` | `/api/hr/benefits/:id` | Benefits | Actualizar beneficio |
| `DELETE` | `/api/hr/benefits/:id` | Benefits | Desactivar beneficio |

---

## Reportes

| Método | Ruta | Página | Descripción |
|---|---|---|---|
| `GET` | `/api/hr/reports/requests-by-status` | Reports | Solicitudes agrupadas por estado |
| `GET` | `/api/hr/reports/requests-by-type` | Reports | Solicitudes agrupadas por tipo |
| `GET` | `/api/hr/reports/requests-over-time` | Reports | Solicitudes en el tiempo |
| `GET` | `/api/hr/reports/active-employees` | Reports | Reporte de empleados activos |
| `GET` | `/api/hr/reports/pending-documents` | Reports | Documentos pendientes de revisión |

> Los reportes se renderizan en tablas dinámicas y pueden exportarse a PDF usando `@react-pdf/renderer`.
