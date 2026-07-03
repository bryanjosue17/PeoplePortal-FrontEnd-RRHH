# Prompt — Diagramas C4 de Arquitectura

## Contexto
Proyecto: PeoplePortal — plataforma de autoservicio HR.  
Tecnologías: .NET 9 API, React 19 (×2 SPAs), PostgreSQL 16, Keycloak 24, APISIX, NATS JetStream, Kubernetes.

---

## Prompt 1: Generar Diagrama C4 Nivel 1 (Contexto del Sistema)

```
Genera un diagrama C4 Nivel 1 (System Context) en formato Mermaid para un sistema llamado
"PeoplePortal". El sistema tiene dos tipos de usuarios externos:
- Colaborador: empleado que consulta su información laboral y hace solicitudes.
- RRHH/Admin: personal de recursos humanos que administra el sistema.

El sistema interactúa con:
- Un servidor de identidad (Keycloak) para autenticación SSO.
- Una base de datos relacional (PostgreSQL).

Usa el formato C4Context de Mermaid y etiquetas en español.
```

**Resultado esperado:** Diagrama `C4Context` con personas y relaciones de alto nivel.

---

## Prompt 2: Generar Diagrama C4 Nivel 2 (Contenedores)

```
Genera un diagrama C4 Nivel 2 (Contenedores) en formato Mermaid para PeoplePortal.
Los contenedores del sistema son:
- Portal Colaborador: SPA React 19 + Vite, puerto 30081
- Panel RRHH: SPA React 19 + Vite, puerto 30082
- APISIX Gateway: API Gateway Apache APISIX, puerto 30090
- Servidor de Identidad: Keycloak 24, puerto 30080
- PeoplePortal API: .NET 9 Backend con Clean Architecture y CQRS
- Base de Datos: PostgreSQL 16 con persistencia PVC en Kubernetes
- NATS JetStream: bus de mensajes para eventos de dominio

Incluye las relaciones entre cada contenedor indicando protocolo y propósito.
Usa etiquetas en español y formato C4Container de Mermaid.
```

---

## Prompt 3: ADR — Architecture Decision Record

```
Escribe un Architecture Decision Record (ADR) en Markdown para documentar la decisión de usar
React 19 con Vite en lugar de Angular para los dos frontends de PeoplePortal.
Incluye las secciones: Contexto, Opciones consideradas, Decisión, Consecuencias positivas y negativas.
```
