# Prompt: Pipeline GitHub Actions CI/CD

## Contexto
Proyecto PeoplePortal con .NET 9 backend y dos frontends React.
Se necesita CI/CD con: build, tests, análisis de cobertura (Codacy), escaneo de seguridad (Trivy), y deploy a K8s local.

## Prompt usado
"Genera un workflow de GitHub Actions para un proyecto .NET 9 con Clean Architecture.
Requisitos:
- Job 1 (build-test): restore, build, dotnet test con cobertura XPlat, upload a Codacy, escaneo Trivy de filesystem.
- Job 2 (deploy-local): solo en rama develop, self-hosted runner, docker build, kubectl apply de manifiestos en /k8s.
- Secrets necesarios: CODACY_PROJECT_TOKEN.
- Condición Codacy: solo si el secret no está vacío para que funcione en forks."

## Resultado
Archivo `.github/workflows/ci.yml` generado con 2 jobs:
- `build-test`: corre en ubuntu-latest, todos los pasos de calidad.
- `deploy-local`: corre en self-hosted (Docker Desktop), kubectl apply secuencial.
Condición Codacy: `if: ${{ env.CODACY_PROJECT_TOKEN != '' }}` para evitar fallos en forks.
