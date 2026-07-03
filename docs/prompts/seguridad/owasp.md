# Prompt — Seguridad y OWASP

## Contexto
Aplicación PeoplePortal. Mapeo contra OWASP Top 10. Keycloak para Auth, APISIX como Gateway.

---

## Prompt 1: Mapeo OWASP Top 10

```
Actúa como un experto en ciberseguridad. Analiza la arquitectura de PeoplePortal y genera
un documento Markdown (seguridad.md) que mapee las protecciones del sistema contra los riesgos
del OWASP Top 10 (2021).

La arquitectura incluye:
- .NET 9 API con EF Core y parámetros fuertemente tipados
- Keycloak 24 con JWT y PKCE S256 para SSO
- APISIX Gateway para ocultar servicios internos
- CORS estricto habilitado en APISIX
- React 19 (escapa HTML por defecto)
- Trivy para escaneo de vulnerabilidades en contenedores

Genera una tabla o viñetas explicando cómo esta arquitectura mitiga al menos las categorías:
A01 (Broken Access Control), A03 (Injection), A04 (Insecure Design), A05 (Security Misconfiguration)
y A07 (Identification and Authentication Failures).
```
