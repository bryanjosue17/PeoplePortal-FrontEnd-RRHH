# Prompt — Frontend Colaborador (React 19 + Vite + MUI)

## Contexto
SPA React 19, Vite, Material UI v9, Keycloak-js + @react-keycloak/web. Portal del empleado en puerto 30081.
Páginas: Dashboard, Solicitudes, Documentos, Comunicados, Beneficios, Perfil.

---

## Prompt 1: Configuración de Keycloak en React

```
Genera la configuración completa de Keycloak para una aplicación React 19 + Vite usando
las librerías keycloak-js y @react-keycloak/web.

Incluye:
1. Archivo keycloak.js que instancia Keycloak con:
   url: import.meta.env.VITE_KEYCLOAK_URL
   realm: import.meta.env.VITE_KEYCLOAK_REALM
   clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID

2. Configuración en main.jsx envolviendo la app con ReactKeycloakProvider:
   - initOptions: { onLoad: 'login-required', pkceMethod: 'S256' }
   - onTokens handler para guardar el token

3. Hook useAuth personalizado que expone:
   - isAuthenticated: boolean
   - userName: string (desde tokenParsed.name o preferred_username)
   - roles: string[] (desde tokenParsed.realm_access.roles)
   - token: string
   - logout(): void

4. Variables de entorno .env.example con todos los VITE_ requeridos
```

---

## Prompt 2: Layout principal con Material UI y drawer navegación

```
Genera el componente Layout.jsx para el Portal del Colaborador de PeoplePortal usando
Material UI v9 (MUI). El layout debe incluir:

1. AppBar superior con:
   - Logo/título "PeoplePortal" a la izquierda
   - Nombre del usuario (desde useKeycloak) a la derecha
   - Botón de cerrar sesión

2. Drawer lateral (permanente en desktop, temporal en móvil) con los ítems de navegación:
   - Dashboard (icono DashboardIcon) → /dashboard
   - Mis Solicitudes (icono AssignmentIcon) → /requests
   - Documentos (icono DescriptionIcon) → /documents
   - Comunicados (icono CampaignIcon) → /announcements
   - Beneficios (icono StarIcon) → /benefits
   - Mi Perfil (icono PersonIcon) → /profile

3. El ítem activo debe resaltarse usando useLocation() de react-router-dom
4. Área de contenido principal con padding apropiado
5. Completamente responsive (breakpoint md)
```

---

## Prompt 3: Página Dashboard del Colaborador

```
Genera el componente Dashboard.jsx para el portal del colaborador de PeoplePortal usando
React 19 y Material UI. El dashboard debe mostrar:

1. Saludo personalizado: "Bienvenido, {nombre}" usando el token de Keycloak

2. Tarjetas de estadísticas (Grid 3 columnas):
   - Solicitudes Pendientes (naranja, AssignmentIcon)
   - Documentos Disponibles (azul, DescriptionIcon)
   - Comunicados Activos (morado, CampaignIcon)
   Con Skeleton de carga mientras se obtienen los datos

3. Sección "Comunicados Recientes" (últimos 3):
   - Cada comunicado en un Paper con título, preview del cuerpo y fecha

4. Sección "Resumen de Beneficios" (Grid 2 columnas junto a comunicados):
   - Lista de beneficios disponibles con nombre y descripción

5. Datos obtenidos desde GET /api/dashboard via axios (apiClient.js)
6. Manejo de error: Alert informativo si el API falla
7. Estado de carga con Skeleton components

Archivo: src/pages/Dashboard/Dashboard.jsx
```

---

## Prompt 4: Página de Solicitudes del Colaborador

```
Genera el componente Requests.jsx para el portal del colaborador de PeoplePortal que permita:

1. Listar las solicitudes del empleado autenticado en una DataGrid de MUI con columnas:
   - Tipo (chip con color según tipo)
   - Estado (chip con color: Pending=amarillo, Approved=verde, Rejected=rojo)
   - Comentarios (truncado a 50 chars)
   - Fecha de solicitud (formateada en español)
   - Notas del revisor

2. Botón "Nueva Solicitud" que abre un Dialog con formulario:
   - Select para Tipo (VacationRequest, PermitRequest, CertificateRequest, SalaryAdvance, Other)
   - TextField para Comentarios (multiline, max 1000 chars, contador de caracteres)
   - Botón Cancelar y Enviar

3. Al enviar: POST /api/requests y refrescar la lista
4. Manejo de loading y errores con Snackbar
5. Validación del formulario antes de enviar

Archivo: src/pages/Requests/Requests.jsx
```

---

## Prompt 5: Cliente HTTP con axios y token automático

```
Genera el apiClient.js para el Frontend Colaborador de PeoplePortal usando axios que:

1. Crea una instancia axios con baseURL: import.meta.env.VITE_API_BASE_URL

2. Interceptor de request que:
   - Obtiene el token actual de Keycloak (keycloak.token)
   - Lo adjunta como header Authorization: Bearer <token>
   - Si el token está por expirar (tokenExpiresIn < 30s), lo refresca primero

3. Interceptor de response que:
   - En error 401 → llama keycloak.logout()
   - En error 403 → redirige a /access-denied
   - En cualquier otro error → lo propaga normalmente

4. Exporta funciones específicas del dashboard:
   - getDashboard(): GET /api/dashboard
   
Archivo: src/api/client.js
```
