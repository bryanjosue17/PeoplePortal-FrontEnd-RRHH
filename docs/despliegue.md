# Despliegue — FrontEnd RRHH

## Local (desarrollo)

```bash
cd PeoplePortal-FrontEnd-RRHH
npm install
npm run dev      # http://localhost:5174
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_KEYCLOAK_URL` | URL del servidor Keycloak | `http://localhost:8080` |
| `VITE_API_URL` | Base URL de la API (vacío = misma origin) | `""` |

Crear `.env.local` para desarrollo:

```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_API_URL=
```

---

## Docker (multi-stage build)

```bash
# Build imagen
docker build -t peopleportal-frontend-rrhh:latest .

# Correr localmente
docker run -p 30082:80 \
  -e VITE_KEYCLOAK_URL=http://localhost:8080 \
  peopleportal-frontend-rrhh:latest
```

El `Dockerfile` usa build multi-stage:
1. **Stage 1 (node):** `npm ci && npm run build` → genera `dist/`
2. **Stage 2 (nginx:alpine):** sirve `dist/` y aplica `nginx.conf`

---

## Configuración nginx

```nginx
server {
    listen 80;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;  # SPA routing
    }

    location /api/ {
        proxy_pass http://peopleportal-api-service:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Kubernetes

Manifiesto: `k8s/overlays/{environment}/kustomization.yaml`

```bash
# Desarrollo (Docker Desktop local) — imagen :develop
kubectl apply -k k8s/overlays/develop/
kubectl rollout restart deployment/frontend-rrhh -n peopleportal

# Producción — imagen :main
kubectl apply -k k8s/overlays/production/
kubectl rollout restart deployment/frontend-rrhh -n peopleportal
```

| Parámetro | develop | production |
|---|---|---|
| Imagen | `ghcr.io/bryanjosue17/peopleportal-frontend-rrhh:develop` | `:main` |
| imagePullPolicy | `Always` | `Always` |
| imagePullSecrets | `ghcr-secret` | `ghcr-secret` |
| Puerto externo | `30082` | `30082` |

**Estructura Kustomize:**
```
k8s/
├── base/              # Deployment + Service base (imagen por defecto :develop)
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── develop/           # Parcha imagen a :develop
    └── production/        # Parcha imagen a :main
```

---

## Dependencias adicionales

```bash
# Exportación PDF en reportes
npm install @react-pdf/renderer
```

---

## CI/CD (GitHub Actions)

Pipeline: `.github/workflows/ci.yml`

| Job | Acciones |
|---|---|
| `build-test` | `npm ci` → `oxlint` → `npm run test:coverage` (Codacy) → `npm run build` |
| `docker` | `docker build` → push a GHCR (`ghcr.io/bryanjosue17/peopleportal-frontend-rrhh`) |

Tags: `{branch}` y `{short-sha}` (7 chars del commit SHA).
