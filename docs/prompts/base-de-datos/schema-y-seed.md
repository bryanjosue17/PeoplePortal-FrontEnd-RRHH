# Prompt — Base de Datos (PostgreSQL + EF Core)

## Contexto
Base de datos: PostgreSQL 16. ORM: EF Core 9. Proyecto: PeoplePortal.Infrastructure.

---

## Prompt 1: ApplicationDbContext con EF Core 9

```
Genera la clase ApplicationDbContext para EF Core 9 en el proyecto PeoplePortal.Infrastructure
que configure las siguientes entidades de PeoplePortal:

Entidades: Employee, HrRequest, Document, Announcement, Benefit, Voucher

Para cada entidad configura en OnModelCreating:
- Employee: tabla "employees", índice único en Email y en KeycloakId, columna HireDate como date
- HrRequest: tabla "hr_requests", FK hacia Employee con restricción de eliminación Restrict,
  columnas Type y Status como string (conversión de enum)
- Document: tabla "documents", FK hacia Employee, índice en EmployeeId + DocumentType
- Announcement: tabla "announcements", índice en IsActive + ExpiresAt para queries de activos
- Benefit: tabla "benefits"
- Voucher: tabla "vouchers", FK hacia Employee, índice compuesto en (EmployeeId, Period)

Incluye IApplicationDbContext con todos los DbSet<T> e implementa SaveChangesAsync.
Namespace: PeoplePortal.Infrastructure.Persistence
```

---

## Prompt 2: Script SQL de seed de datos reales

```
Genera un script SQL de datos semilla (seed) para PostgreSQL para el proyecto PeoplePortal.
El script debe insertar:

1. 10 empleados en la tabla "employees" con datos realistas (nombres en español, 
   departamentos: TI, RRHH, Ventas, Finanzas, Operaciones, posiciones variadas)

2. 5 solicitudes en "hr_requests" con diferentes tipos y estados:
   - 2 pendientes (Vacation, Permit)
   - 2 aprobadas (Certificate, VacationRequest)
   - 1 rechazada

3. 4 comunicados en "announcements" (2 activos, 1 expirado, 1 urgente)

4. 6 beneficios en "benefits" (salud, transporte, alimentación, educación)

5. 8 documentos en "documents" (contratos, vouchers para distintos empleados)

Usar INSERT INTO con valores fijos usando gen_random_uuid() para los UUIDs.
Incluir un BEGIN/COMMIT transaction y comentarios explicativos.
```

---

## Prompt 3: Diagrama ER en Mermaid

```
Genera un diagrama Entidad-Relación en formato Mermaid (erDiagram) para la base de datos de
PeoplePortal con las siguientes entidades y relaciones:

Entidades:
- employees (id, keycloak_id, first_name, last_name, email, position, department, hire_date,
  is_active, phone_number, address, created_at)
- hr_requests (id, employee_id FK, type, status, comments, requested_at, updated_at,
  reviewed_by, reviewer_notes)
- documents (id, employee_id FK, title, document_type, file_url, uploaded_at, uploaded_by, is_active)
- announcements (id, title, body, type, published_at, expires_at, created_by, is_active)
- benefits (id, name, description, benefit_type, is_active, start_date, end_date)
- vouchers (id, employee_id FK, period, file_url, uploaded_at, uploaded_by)

Relaciones:
- employees ||--o{ hr_requests : "crea"
- employees ||--o{ documents : "posee"
- employees ||--o{ vouchers : "recibe"

Muestra las cardinalidades correctas.
```

---

## Prompt 4: Migration inicial con EF Core

```
Describe los pasos y genera el comando para crear la migración inicial del esquema de
PeoplePortal con EF Core 9 Code First.

Incluye:
1. El comando dotnet ef migrations add InitialCreate desde el proyecto PeoplePortal.Api
   especificando el proyecto de contexto Infrastructure
2. El comando dotnet ef database update para aplicar la migración
3. Cómo configurar la cadena de conexión en appsettings.Development.json para PostgreSQL local:
   Host=localhost;Port=5432;Database=peopleportal;Username=postgres;Password=postgres
4. La configuración del DbContext en Program.cs usando Npgsql
5. Cómo ejecutar migraciones automáticamente al arrancar la API (database.MigrateAsync())
```
