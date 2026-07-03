# Arquitectura — FrontEnd RRHH

## Páginas implementadas

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `Dashboard.jsx` | KPIs: empleados activos, solicitudes pendientes, documentos, comunicados |
| `/employees` | `Employees.jsx` | Listado paginado con búsqueda y creación de empleados |
| `/employees/:id` | `EmployeeDetail.jsx` | Detalle completo del empleado (perfil, documentos, solicitudes) |
| `/documents` | `Documents.jsx` | Gestión de documentos de todos los colaboradores (paginado, filtros) |
| `/requests` | `Requests.jsx` | Solicitudes con filtros, aprobación, rechazo y comentario RRHH |
| `/announcements` | `Announcements.jsx` | Publicar, visualizar y desactivar comunicados internos |
| `/benefits` | `Benefits.jsx` | Catálogo CRUD: crear, editar y desactivar beneficios |
| `/vouchers` | `Vouchers.jsx` | Gestión de vouchers de pago: crear, subir archivos (nómina) |
| `/reports` | `Reports.jsx` | Reportes dinámicos + exportación PDF |
| `/access-denied` | `AccessDenied.jsx` | Pantalla para usuarios sin rol `hr` o `admin` |

---

## Estructura del proyecto

```
PeoplePortal-FrontEnd-RRHH/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js              ← Axios + interceptor Bearer
│   │   ├── announcements.js
│   │   ├── benefits.js
│   │   ├── employees.js
│   │   ├── hrDocuments.js
│   │   ├── hrRequests.js
│   │   ├── hrVouchers.js          ← Gestión de vouchers (nómina)
│   │   └── reports.js
│   ├── components/
│   │   ├── Layout.jsx             ← Sidebar + header + campana de notificaciones pendientes
│   │   └── ProtectedRoute.jsx     ← Guard por rol (hr / admin)
│   ├── context/
│   │   └── ThemeContext.jsx       ← Tema claro/oscuro/sistema
│   ├── pages/
│   │   ├── Announcements/
│   │   ├── Benefits/
│   │   ├── Dashboard/
│   │   ├── Documents/
│   │   ├── EmployeeDetail/
│   │   ├── Employees/
│   │   ├── Reports/
│   │   ├── Requests/
│   │   ├── Vouchers/              ← Nueva sección de gestión de vouchers
│   │   └── AccessDenied/
│   ├── test/
│   ├── theme/
│   │   └── theme.js               ← Tema MUI v9 con dark mode Material 3
│   ├── keycloak.js
│   ├── App.jsx
│   └── main.jsx
├── k8s/
│   └── frontend-rrhh.yaml
├── Dockerfile
├── nginx.conf
├── vite.config.js
└── docs/
```

---

## Árbol de rutas (React Router v7)

```
/                    → redirect a /dashboard
/dashboard           → Dashboard  ┐
/employees           → Employees  │
/employees/:id       → EmployeeDetail │ Todas envueltas en <ProtectedRoute>
/documents           → Documents  │ (verifica rol hr o admin)
/requests            → Requests   │
/announcements       → Announcements │
/benefits            → Benefits   │
/vouchers            → Vouchers   │ (gestión nómina - visible para hr, admin, nomina)
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
