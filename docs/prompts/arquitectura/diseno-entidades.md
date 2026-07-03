# Prompt — Diseño de Entidades del Dominio

## Contexto
Backend: .NET 9, Clean Architecture. Capa Domain contiene las entidades puras sin dependencias externas.

---

## Prompt 1: Generar entidades del dominio principal

```
Soy un desarrollador .NET 9 construyendo el dominio de un sistema HR llamado PeoplePortal.
Necesito las entidades del dominio en C# para la capa Domain (sin referencias a EF Core ni a ninguna
librería de infraestructura). Las entidades son:

1. Employee: Id (Guid), KeycloakId (string), FirstName, LastName, Email, Position, Department,
   HireDate, IsActive, PhoneNumber, Address, CreatedAt.

2. HrRequest: Id (Guid), EmployeeId (FK), Type (enum), Status (enum), Comments, RequestedAt,
   UpdatedAt, ReviewedBy (string nullable), ReviewerNotes.
   Tipos: VacationRequest, PermitRequest, CertificateRequest, Other.
   Estados: Pending, Approved, Rejected, Cancelled.

3. Document: Id, EmployeeId (FK), Title, DocumentType (enum), FileUrl, UploadedAt, UploadedBy, IsActive.

4. Announcement: Id, Title, Body, Type (enum), PublishedAt, ExpiresAt, CreatedBy, IsActive.

5. Benefit: Id, Name, Description, BenefitType (enum), IsActive, StartDate, EndDate nullable.

6. Voucher: Id, EmployeeId (FK), Period, FileUrl, UploadedAt, UploadedBy.

Genera las clases con propiedades y constructores privados siguiendo el patrón de DDD básico.
```

---

## Prompt 2: Generar enums del dominio

```
Genera los enums en C# para el dominio de PeoplePortal:
- HrRequestType: VacationRequest, PermitRequest, CertificateRequest, SalaryAdvance, Other
- HrRequestStatus: Pending, Approved, Rejected, Cancelled
- DocumentType: PayVoucher, Contract, Certificate, IdentityDocument, Other
- AnnouncementType: General, Urgent, Policy, Event
- BenefitType: Health, Transport, Food, Education, Recreation, Other

Coloca cada enum en su propio archivo dentro del namespace PeoplePortal.Domain.Enums.
```
