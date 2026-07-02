import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseKeycloak = vi.fn();

vi.mock('@react-keycloak/web', () => ({
  useKeycloak: () => mockUseKeycloak(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner cuando no esta inicializado', () => {
    mockUseKeycloak.mockReturnValue({
      initialized: false,
      keycloak: null,
    });

    render(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('no renderiza children cuando no esta autenticado', () => {
    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak: { authenticated: false },
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra acceso denegado sin rol hr/admin', () => {
    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak: {
        authenticated: true,
        tokenParsed: {
          realm_access: {
            roles: ['employee'],
          },
        },
      },
    });

    render(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renderiza children con rol hr', () => {
    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak: {
        authenticated: true,
        tokenParsed: {
          realm_access: {
            roles: ['hr'],
          },
        },
      },
    });

    render(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
  });
});
