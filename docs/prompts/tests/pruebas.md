# Prompt — Testing Unitario e Integración

## Contexto
Proyectos:
- Backend: xUnit, Moq, FluentAssertions, MediatR
- Frontend Colaborador/RRHH: Vitest, React Testing Library, jsdom

---

## Prompt 1: Pruebas unitarias para Handler CQRS (Backend)

```
Genera las pruebas unitarias usando xUnit, Moq y FluentAssertions para el 
CreateHrRequestCommandHandler de PeoplePortal.Application.

Cubre los siguientes escenarios:
1. Handle_Should_CreateRequestAndReturnId_WhenCommandIsValid: verifica que el ID
   se genere, el repositorio sea llamado, y SaveChangesAsync sea llamado una vez.
2. Handle_Should_ThrowNotFoundException_WhenEmployeeDoesNotExist: usando un mock
   de IApplicationDbContext donde el empleado no exista.
3. Validator_Should_HaveError_WhenCommentsExceedLimit: prueba unitaria del 
   CreateHrRequestCommandValidator comprobando la longitud máxima.

Usa el patrón Arrange-Act-Assert.
```

---

## Prompt 2: Smoke Tests para Componentes React (Frontend)

```
Genera pruebas unitarias/smoke tests para el componente Dashboard.jsx de PeoplePortal
(React 19) usando Vitest y React Testing Library.

El componente requiere el mock de @react-keycloak/web porque usa useKeycloak().

Crea los siguientes tests:
1. "renders without crashing": renderiza el Dashboard dentro de un MemoryRouter
   usando un mock de useKeycloak que retorne { keycloak: { tokenParsed: { given_name: 'Test' } } }.
2. "shows skeleton loaders initially": verifica que muestre Skeletons si loading es true.
3. "displays correct summary values": haz mock de getDashboard (axios) para retornar
   datos fijos y verifica que screen.findByText encuentre los valores correctos en pantalla.

Envuelve las aserciones asíncronas en act() para evitar advertencias de React 18.
Configura testTimeout en 20000ms si usas findByText.
```
