import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza children cuando no esta autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra acceso denegado sin rol hr/admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        realm_access: {
          roles: ['employee'],
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
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        realm_access: {
          roles: ['hr'],
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
