# Prompt — Manifiestos Kubernetes

## Contexto
Kubernetes local con Docker Desktop. Namespace: `peopleportal`. NodePort services para acceso local.
Stack: PostgreSQL, Keycloak, NATS, API .NET 9, 2 Frontends React, APISIX Gateway.

---

## Prompt 1: Namespace y Secret de Kubernetes

```
Genera los manifiestos Kubernetes YAML para:

1. namespace.yaml: crea el namespace "peopleportal" con label app: peopleportal

2. secret.yaml: crea un Secret llamado "peopleportal-secrets" en el namespace peopleportal con:
   - POSTGRES_PASSWORD (base64)
   - POSTGRES_USER (base64)
   - POSTGRES_DB (base64)
   - KEYCLOAK_ADMIN (base64)
   - KEYCLOAK_ADMIN_PASSWORD (base64)

Usa kubectl create secret generic como referencia pero entrega el YAML completo listo para aplicar.
```

---

## Prompt 2: Deployment de PostgreSQL en Kubernetes

```
Genera un manifiesto Kubernetes YAML completo para desplegar PostgreSQL 16 en el namespace
"peopleportal" con:

- Deployment con 1 réplica, imagen postgres:16-alpine
- Variables de entorno desde el Secret "peopleportal-secrets"
- PersistentVolumeClaim de 2Gi con storageClass estándar
- Montar el PVC en /var/lib/postgresql/data
- Service de tipo ClusterIP en puerto 5432
- Resource limits: 512Mi RAM, 500m CPU

El Deployment debe tener readinessProbe usando pg_isready.
```

---

## Prompt 3: Deployment de Keycloak en Kubernetes

```
Genera el manifiesto Kubernetes para Keycloak 24 en el namespace "peopleportal":

- Deployment con imagen quay.io/keycloak/keycloak:24.0.1
- Comando de start: ["start-dev"]
- Variables: KC_DB=postgres, KC_DB_URL, KC_DB_USERNAME, KC_DB_PASSWORD (desde Secret),
  KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD
- Montar un ConfigMap con el realm JSON pre-configurado en /opt/keycloak/data/import/
- Arg --import-realm para auto-importar el realm al arrancar
- Service NodePort en puerto 30080 → 8080
- InitContainer que espera a que PostgreSQL esté disponible
```

---

## Prompt 4: Deployment de APISIX Gateway

```
Genera el manifiesto Kubernetes para Apache APISIX como API Gateway en "peopleportal":

- Deployment con imagen apache/apisix:latest, 1 réplica
- ConfigMap con la configuración de apisix.yaml que incluye:
  - etcd embebido (standalone mode)
  - Plugin openid-connect apuntando a Keycloak realm peopleportal
  - Route que proxy hacia el backend API en /api/*
  - CORS habilitado para los orígenes de los frontends
- Service NodePort: 30090 → 9080
- Montar el ConfigMap en /usr/local/apisix/conf/
```

---

## Prompt 5: Script de despliegue automatizado

```
Genera un script PowerShell (deploy.ps1) que automatice el despliegue completo de PeoplePortal
en Kubernetes local (Docker Desktop) con los siguientes pasos:

1. Verificar que kubectl y docker están disponibles
2. Crear el namespace peopleportal si no existe
3. Aplicar los manifiestos en orden:
   a. namespace.yaml
   b. secret.yaml
   c. PostgreSQL (deployment + service + pvc)
   d. NATS (deployment + service)
   e. Keycloak (configmap-realm + deployment + service)
   f. API Backend (deployment + service)
   g. Frontend Colaborador (deployment + service)
   h. Frontend RRHH (deployment + service)
   i. APISIX (configmap + deployment + service)
4. Esperar (kubectl rollout status) a que cada deployment esté listo antes de continuar
5. Mostrar resumen final con las URLs de acceso
6. Manejar errores con mensajes descriptivos en rojo

El script debe ser idempotente (se puede ejecutar múltiples veces).
```
