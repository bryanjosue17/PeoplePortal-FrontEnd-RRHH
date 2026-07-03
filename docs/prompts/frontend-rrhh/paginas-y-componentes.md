# Prompt — Frontend RRHH (React 19 + Vite + MUI — Panel Administrativo)

## Contexto
SPA React 19, Vite, Material UI v9, @react-keycloak/web. Panel administrativo RRHH en puerto 30082.
Roles requeridos: `hr` o `admin`. Páginas: Dashboard, Empleados, Solicitudes, Documentos, Comunicados, Beneficios, Reportes.

---

## Prompt 1: ProtectedRoute con validación de roles

```
Genera el componente ProtectedRoute.jsx para el Panel RRHH de PeoplePortal que:

1. Verifica si Keycloak está inicializado (keycloak.initialized):
   - Si no está inicializado → mostrar CircularProgress centrado

2. Verifica si el usuario está autenticado (keycloak.authenticated):
   - Si no está autenticado → redirigir al login de Keycloak

3. Recibe una prop "roles" (array de strings) y verifica que el usuario tiene al menos uno:
   - Obtiene roles desde keycloak.tokenParsed?.realm_access?.roles
   - Si no tiene el rol → redirigir a /access-denied

4. Si pasa todas las validaciones → renderiza children

Uso esperado:
<ProtectedRoute roles={['hr', 'admin']}>
  <Dashboard />
</ProtectedRoute>

Archivo: src/components/ProtectedRoute.jsx
```

---

## Prompt 2: Dashboard del Panel RRHH

```
Genera el componente Dashboard.jsx para el Panel RRHH de PeoplePortal con React 19 + MUI:

1. KPI Cards (Grid 4 columnas en desktop, 2 en tablet):
   - Total Empleados Activos (verde, PeopleIcon)
   - Solicitudes Pendientes (naranja, AssignmentIcon)
   - Documentos Cargados (azul, DescriptionIcon)
   - Comunicados Activos (morado, CampaignIcon)
   Con Skeleton mientras cargan

2. Sección de Acciones Rápidas (Botones prominentes):
   - "Gestionar Empleados" → /employees
   - "Revisar Solicitudes" → /requests
   - "Cargar Documento" → /documents (abre modal)
   - "Nuevo Comunicado" → /announcements (abre modal)

3. Tabla de Solicitudes Recientes (últimas 5):
   - Columnas: Empleado, Tipo, Estado (chip), Fecha

4. Datos obtenidos en paralelo con Promise.all desde:
   GET /api/employees, GET /api/requests, GET /api/documents, GET /api/announcements

Archivo: src/pages/Dashboard/Dashboard.jsx
```

---

## Prompt 3: Página de Gestión de Empleados

```
Genera el componente Employees.jsx para el Panel RRHH de PeoplePortal:

1. DataGrid de MUI con columnas:
   - Nombre completo (FirstName + LastName)
   - Email
   - Departamento
   - Puesto/Posición
   - Estado (chip Activo/Inactivo)
   - Fecha de contratación (formato dd/MM/yyyy)
   - Acciones: Ver detalles (IconButton)

2. Barra de herramientas con:
   - Buscador de texto (filtra por nombre o email en tiempo real)
   - Filtro por Departamento (Select)
   - Filtro por Estado (Activo/Inactivo)

3. Paginación server-side (page, pageSize)

4. Al hacer clic en "Ver detalles" → navegar a /employees/:id

5. Datos de: GET /api/employees con query params ?search=&department=&isActive=&page=&pageSize=

Archivo: src/pages/Employees/Employees.jsx
```

---

## Prompt 4: Página de Revisión de Solicitudes RRHH

```
Genera el componente Requests.jsx para el Panel RRHH que permita:

1. DataGrid con columnas:
   - Empleado (nombre)
   - Tipo de solicitud (chip)
   - Estado actual (chip con colores)
   - Comentarios del empleado
   - Fecha de solicitud
   - Acciones: Aprobar / Rechazar (IconButtons, solo si status = Pending)

2. Filtros en la barra superior:
   - Por estado (Todos, Pendientes, Aprobados, Rechazados)
   - Por tipo de solicitud
   - Rango de fechas (DatePicker de MUI)

3. Al hacer clic en Aprobar/Rechazar:
   - Abrir Dialog de confirmación con campo para "Notas del revisor"
   - Al confirmar: PATCH /api/requests/:id/status con body { status, reviewerNotes }
   - Refrescar la tabla tras la acción
   - Mostrar Snackbar de éxito o error

Archivo: src/pages/Requests/Requests.jsx
```

---

## Prompt 5: Gestión de Comunicados

```
Genera el componente Announcements.jsx para el Panel RRHH de PeoplePortal que permita
a los administradores gestionar comunicados internos:

1. Lista de comunicados en Cards con:
   - Título (h6)
   - Tipo (chip: General=azul, Urgent=rojo, Policy=naranja, Event=verde)
   - Estado activo/inactivo
   - Fecha de publicación y expiración
   - Botón Editar y Desactivar

2. FAB (Floating Action Button) para crear nuevo comunicado que abre Dialog con:
   - TextField: Título (requerido, max 200 chars)
   - Select: Tipo (General, Urgent, Policy, Event)
   - TextField multiline: Contenido (requerido, max 5000 chars)
   - DatePicker: Fecha de expiración (opcional)
   - Botones: Cancelar / Publicar

3. Al publicar: POST /api/announcements
4. Al desactivar: PATCH /api/announcements/:id (toggle IsActive)
5. Ordenar por fecha de publicación descendente

Archivo: src/pages/Announcements/Announcements.jsx
```
