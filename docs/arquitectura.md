# Arquitectura — FrontEnd RRHH

## Páginas implementadas

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `Dashboard.jsx` | KPIs: empleados activos, solicitudes pendientes, documentos, comunicados |
| `/employees` | `Employees.jsx` | Listado de empleados con búsqueda y creación |
| `/employees/:id` | `EmployeeDetail.jsx` | Detalle completo del empleado (perfil, edición) |
| `/documents` | `Documents.jsx` | Gestión de documentos de todos los colaboradores |
| `/requests` | `Requests.jsx` | Solicitudes con filtros, aprobación y rechazo |
| `/announcements` | `Announcements.jsx` | Publicar y administrar comunicados internos |
| `/benefits` | `Benefits.jsx` | Catálogo CRUD: crear, editar y desactivar beneficios |
| `/reports` | `Reports.jsx` | Reportes dinámicos + exportación PDF |
| `/access-denied` | `AccessDenied.jsx` | Pantalla para usuarios sin rol `hr` o `admin` |

---

## Estructura del proyecto

```
PeoplePortal-FrontEnd-RRHH/
├── public/
├── src/
│   ├── api/
│   │   └── client.js              ← Axios + interceptor Bearer
│   ├── components/
│   │   ├── Layout.jsx             ← Sidebar + header con usuario y logout
│   │   └── ProtectedRoute.jsx     ← Guard por rol (hr / admin)
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── EmployeeDetail.jsx
│   │   ├── Documents.jsx
│   │   ├── Requests.jsx
│   │   ├── Announcements.jsx
│   │   ├── Benefits.jsx
│   │   ├── Reports.jsx
│   │   └── AccessDenied.jsx
│   ├── test/
│   │   ├── keycloak.test.js
│   │   ├── client.test.js
│   │   ├── Layout.test.jsx
│   │   └── Dashboard.test.jsx
│   ├── theme/
│   │   └── index.js               ← Tema MUI personalizado
│   ├── keycloak.js
│   ├── App.jsx                    ← Router + ReactKeycloakProvider
│   └── main.jsx
├── k8s/
│   └── frontend-rrhh.yaml
├── Dockerfile
├── nginx.conf
├── vite.config.js
└── docs/                          ← esta carpeta
```

---

## Árbol de rutas (React Router v7)

```
/                    → redirect a /dashboard
/dashboard           → Dashboard  ┐
/employees           → Employees  │ Todas envueltas en <ProtectedRoute>
/employees/:id       → EmployeeDetail │ (verifica rol hr o admin)
/documents           → Documents  │
/requests            → Requests   │
/announcements       → Announcements │
/benefits            → Benefits   │
/reports             → Reports    ┘
/access-denied       → AccessDenied (público, sin guard)
```

---

## ProtectedRoute

El componente `ProtectedRoute.jsx` protege todas las rutas del panel:

1. Espera a que Keycloak inicialice (`initialized === false` → spinner)
2. Verifica `keycloak.authenticated`
3. Verifica que `keycloak.tokenParsed.realm_access.roles` incluya `hr` o `admin`
4. Si no tiene rol → redirige a `/access-denied`

---

## Tests

| Archivo | Qué cubre | Tests |
|---|---|---|
| `keycloak.test.js` | Configuración: URL, realm, clientId | 3 |
| `client.test.js` | Instancia Axios + interceptor Bearer | 5 |
| `Layout.test.jsx` | Navegación, nombre usuario, logout | 6 |
| `Dashboard.test.jsx` | Estados loading / error / data | 4 |
| **Total** | | **18** |
