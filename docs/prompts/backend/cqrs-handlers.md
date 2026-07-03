# Prompt — Backend .NET 9 (Clean Architecture + CQRS)

## Contexto
API .NET 9 con Clean Architecture. Capas: Domain, Application (CQRS con MediatR), Infrastructure (EF Core 9, PostgreSQL, NATS), Api (Controllers REST + JWT).

---

## Prompt 1: Scaffolding de un Handler CQRS completo

```
Genera el código C# completo para un caso de uso "CreateHrRequest" siguiendo el patrón CQRS con
MediatR en .NET 9 para el proyecto PeoplePortal.Application.

Incluye:
1. Command: CreateHrRequestCommand con propiedades EmployeeId (Guid), Type (HrRequestType), Comments (string)
2. CommandHandler: IRequestHandler<CreateHrRequestCommand, Guid>
   - Inyecta IApplicationDbContext
   - Crea una nueva entidad HrRequest con Status = Pending
   - Persiste en BD mediante EF Core
   - Retorna el Id del nuevo registro
3. Validator (FluentValidation): CreateHrRequestCommandValidator
   - EmployeeId no puede ser Guid vacío
   - Comments no puede superar 1000 caracteres
4. IApplicationDbContext: interfaz de la capa Application con DbSet<HrRequest>

Namespace: PeoplePortal.Application.Requests.Commands.CreateHrRequest
```

---

## Prompt 2: Scaffolding de una Query CQRS

```
Genera el código C# para la query "GetEmployeeDashboard" en PeoplePortal usando CQRS con MediatR:

1. Query: GetEmployeeDashboardQuery con EmployeeId (Guid)
2. QueryResult/DTO: EmployeeDashboardDto con:
   - List<AnnouncementDto> ActiveAnnouncements (últimos 5 activos)
   - List<BenefitDto> AvailableBenefits
   - int PendingRequestsCount
   - List<DocumentDto> RecentDocuments (últimos 5)
3. Handler: GetEmployeeDashboardQueryHandler
   - Consulta en paralelo (Task.WhenAll) los 4 datos
   - Mapea entidades a DTOs manualmente (sin AutoMapper)
4. Controller endpoint: GET /api/dashboard (protegido con [Authorize])

Namespace: PeoplePortal.Application.Dashboard.Queries.GetEmployeeDashboard
```

---

## Prompt 3: Configurar JWT Bearer con Keycloak

```
Genera el código de configuración de autenticación JWT Bearer en Program.cs de una API .NET 9
que valida tokens emitidos por Keycloak con las siguientes características:

- Authority: http://keycloak.peopleportal.svc.cluster.local:8080/realms/peopleportal
- Audience: account
- ValidateAudience: true
- ValidateIssuerSigningKey: true
- NameClaimType: "preferred_username"
- RoleClaimType: "realm_access.roles" (mapeado desde el token de Keycloak)
- Método de extensión AddKeycloakJwtBearer(this IServiceCollection services, IConfiguration config)

Incluye también la configuración para leer roles desde el claim realm_access usando un
ClaimsTransformation que transforma el JWT claim de Keycloak al formato de Claims de .NET.
```

---

## Prompt 4: NATS JetStream Consumer

```
Genera un BackgroundService en .NET 9 que actúe como consumer de NATS JetStream para el
proyecto PeoplePortal.Infrastructure.

El servicio debe:
1. Conectarse a NATS usando NATS.Net (nats.net v2)
2. Crear o usar un stream llamado "PEOPLEPORTAL" con subjects: ["peopleportal.>"]
3. Suscribirse al subject "peopleportal.requests.created"
4. Deserializar el mensaje a un DTO HrRequestCreatedEvent
5. Procesar el evento (ej: enviar notificación simulada con ILogger)
6. Hacer Ack del mensaje en caso de éxito, Nack en caso de error
7. Reintentar hasta 3 veces con backoff exponencial

Nombre de clase: HrRequestCreatedConsumer
Registrar en DI como hosted service.
```

---

## Prompt 5: Pipeline de CI/CD con GitHub Actions para .NET

```
Genera un workflow de GitHub Actions (.github/workflows/ci.yml) para el proyecto PeoplePortal
backend (.NET 9) que:

1. Se dispare en push y pull_request a la rama develop
2. Tenga 3 jobs:
   a. build: restore, build y verificar que compila sin errores
   b. test: ejecutar pruebas unitarias e integración con cobertura (coverlet)
      - Publicar reporte de cobertura como artifact
      - Fallar si cobertura < 60%
   c. security: ejecutar Trivy para escanear vulnerabilidades en la imagen Docker

3. El job test debe usar una base de datos PostgreSQL como service container
4. Cachear los paquetes NuGet para acelerar el pipeline
5. Enviar el reporte de cobertura a Codacy usando CODACY_PROJECT_TOKEN secret
```

---

## Prompt 6: Middleware de manejo de excepciones

```
Genera un GlobalExceptionHandlerMiddleware para una API .NET 9 de PeoplePortal que:

1. Capture cualquier excepción no manejada en el pipeline
2. Retorne siempre JSON con el formato:
   { "type": "error", "title": "...", "status": 500, "detail": "...", "traceId": "..." }
3. Mapee excepciones específicas:
   - NotFoundException (custom) → 404 Not Found
   - ValidationException (FluentValidation) → 422 Unprocessable Entity con errores por campo
   - UnauthorizedAccessException → 401
   - Cualquier otra → 500 Internal Server Error (sin exponer stack trace en producción)
4. Loguee el error con ILogger incluyendo TraceId para trazabilidad
5. Registrarse en Program.cs como app.UseMiddleware<GlobalExceptionHandlerMiddleware>()
```
