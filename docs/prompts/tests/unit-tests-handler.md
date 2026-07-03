# Prompt: Tests unitarios para handlers CQRS

## Contexto
Proyecto .NET 9 con MediatR, NSubstitute y xUnit.
Handlers: CreateVacationRequestCommandHandler, CreateCertificateRequestCommandHandler,
UpdateRequestStatusCommandHandler, GetMyRequestsQueryHandler, CreateAnnouncementCommandHandler,
GetActiveAnnouncementsQueryHandler, GetActiveBenefitsQueryHandler, UploadDocumentCommandHandler,
UpdateDocumentStatusCommandHandler, CreateEmployeeCommandHandler, UpdateMyProfileCommandHandler.

## Prompt usado
"Genera tests unitarios xUnit para handlers CQRS de .NET 9.
Patrón: instanciar handler con repositorio NSubstitute, ejecutar Handle(), verificar con FluentAssertions.
Cubrir: happy path, comportamiento de persistencia (AddAsync + SaveChangesAsync), publicación de eventos NATS.
Un archivo por módulo: Requests, Documents, Employees, Announcements, Benefits."

## Resultado
Tests generados en `tests/PeoplePortal.UnitTests/`:
- `Application/Requests/RequestHandlersTests.cs` — 4 tests
- `Application/Documents/DocumentHandlerTests.cs` — 2 tests
- `Application/Employees/EmployeeHandlerTests.cs` — 2 tests
- `Application/Announcements/AnnouncementHandlerTests.cs` — 2 tests
- `Application/Benefits/BenefitHandlerTests.cs` — 2 tests
- `Domain/` — 6 archivos de tests de entidades (31 tests de dominio)
Total: 37 tests → cobertura ≥ 60%.
