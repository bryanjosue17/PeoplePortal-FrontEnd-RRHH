# Prompt — CI/CD y Workflows

## Contexto
Monorepo con submódulos. Cada submódulo tiene su propio workflow de GitHub Actions.
Análisis de código con Codacy y escaneo de vulnerabilidades con Trivy.

---

## Prompt 1: CI Pipeline para Frontend React + Vite

```
Genera un workflow de GitHub Actions (ci.yml) para un proyecto React 19 + Vite
(PeoplePortal-FrontEnd-RRHH) que se ejecute en push y pull_request a develop y main.

El pipeline debe contener 2 jobs:

1. build-and-test:
   - runs-on: ubuntu-latest
   - checkout del código
   - setup de Node.js 22
   - npm ci
   - npm test (ejecutar Vitest)
   - npm run build (verificar que el build de Vite pasa correctamente)

2. security-scan:
   - runs-on: ubuntu-latest
   - checkout del código
   - ejecutar aquasecurity/trivy-action para escanear el directorio raíz buscando
     vulnerabilidades en package-lock.json de severidad HIGH,CRITICAL.
```
