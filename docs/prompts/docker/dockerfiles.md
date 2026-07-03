# Prompt — Dockerfile y Docker Compose

## Contexto
Proyecto PeoplePortal. Tres imágenes: API .NET 9, Frontend Colaborador (React/Vite/Nginx), Frontend RRHH (React/Vite/Nginx).

---

## Prompt 1: Dockerfile para API .NET 9

```
Genera un Dockerfile multi-stage optimizado para una API .NET 9 con la siguiente estructura:
- Solución llamada PeoplePortal.sln en la raíz
- Proyectos: PeoplePortal.Api, PeoplePortal.Application, PeoplePortal.Domain, PeoplePortal.Infrastructure

Stage 1 (build): usa mcr.microsoft.com/dotnet/sdk:9.0, copia los .csproj, hace restore, copia el
resto y publica en modo Release a /app/publish.

Stage 2 (runtime): usa mcr.microsoft.com/dotnet/aspnet:9.0, expone puerto 8080, copia el output
del stage de build y define ENTRYPOINT para PeoplePortal.Api.dll.

Incluye un .dockerignore apropiado para proyectos .NET.
```

**Resultado esperado:** Dockerfile de 2 stages, imagen final ~150MB.

---

## Prompt 2: Dockerfile para Frontend React/Vite con Nginx

```
Genera un Dockerfile multi-stage para una aplicación React 19 + Vite que:

Stage 1 (node:22-alpine): 
- Establece WORKDIR /app
- Copia package.json y package-lock.json y ejecuta npm ci
- Copia el resto del código y ejecuta npm run build
- El output queda en /app/dist

Stage 2 (nginx:alpine):
- Copia el /app/dist del stage anterior a /usr/share/nginx/html
- Copia una configuración nginx.conf personalizada para SPA (react-router):
  - Sirve archivos estáticos
  - Hace proxy de /api/ a la URL del backend (variable de entorno)
  - Para rutas no encontradas retorna index.html (client-side routing)
- Expone puerto 80

Incluye también la configuración nginx.conf.
```

---

## Prompt 3: Docker Compose para desarrollo local

```
Genera un docker-compose.yml para levantar localmente el stack de PeoplePortal para desarrollo:

Servicios:
1. postgres: imagen postgres:16-alpine, puerto 5432, volumen persistente, variables de entorno
   POSTGRES_DB=peopleportal, POSTGRES_USER, POSTGRES_PASSWORD
2. keycloak: imagen quay.io/keycloak/keycloak:24, modo dev, puerto 8080, depende de postgres,
   configura KC_DB=postgres, KC_DB_URL, KEYCLOAK_ADMIN=admin, KEYCLOAK_ADMIN_PASSWORD=admin
3. nats: imagen nats:latest con JetStream habilitado (-js), puerto 4222
4. api: build desde ./PeoplePortal-BackEnd, depende de postgres y nats, puerto 8080
5. frontend-colaborador: build desde ./PeoplePortal-FrontEnd-Colaborador, puerto 3000
6. frontend-rrhh: build desde ./PeoplePortal-FrontEnd-RRHH, puerto 3001

Agrega una red llamada peopleportal-net y un volumen postgres_data.
```

---

## Prompt 4: Script de build de imágenes Docker

```
Genera un script PowerShell (build.ps1) que construya las 3 imágenes Docker del proyecto
PeoplePortal y las etiquete con la versión actual del commit de git.

El script debe:
1. Obtener el hash corto del commit: git rev-parse --short HEAD
2. Construir peopleportal-api desde ./PeoplePortal-BackEnd
3. Construir peopleportal-frontend-colaborador desde ./PeoplePortal-FrontEnd-Colaborador
4. Construir peopleportal-frontend-rrhh desde ./PeoplePortal-FrontEnd-RRHH
5. Etiquetar cada imagen con :latest y :<git-hash>
6. Mostrar en consola el progreso de cada paso con Write-Host en colores

Agregar manejo de errores con try/catch y exit 1 en caso de fallo.
```
