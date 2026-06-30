import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@react-keycloak/web', () => ({
  useKeycloak: () => ({
    keycloak: {
      tokenParsed: {
        given_name: 'Admin',
        preferred_username: 'admin',
      },
    },
  }),
}));

vi.mock('../api/dashboard', () => ({
  getDashboard: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { getDashboard } from '../api/dashboard';

async function renderDashboard() {
  const Dashboard = (await import('../pages/Dashboard/Dashboard')).default;
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

it('shows welcome message and panel title', async () => {
  getDashboard.mockResolvedValue({ data: {} });
  await renderDashboard();
  expect(await screen.findByText(/Bienvenido/)).toBeInTheDocument();
  expect(await screen.findByText(/Panel de administraci.n de Recursos Humanos/)).toBeInTheDocument();
});

it('renders summary cards after loading', async () => {
  getDashboard.mockResolvedValue({
    data: { totalEmployees: 10, pendingRequests: 5, activeDocuments: 20, recentAnnouncements: 3 },
  });
  await renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Documentos Activos')).toBeInTheDocument();
    expect(screen.getByText('Comunicados Recientes')).toBeInTheDocument();
  });
});

it('displays correct summary values', async () => {
  getDashboard.mockResolvedValue({
    data: { totalEmployees: 10, pendingRequests: 5, activeDocuments: 20, recentAnnouncements: 3 },
  });
  await renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

it('shows quick action buttons', async () => {
  getDashboard.mockResolvedValue({ data: {} });
  await renderDashboard();
  expect(await screen.findByText('Gestionar Empleados')).toBeInTheDocument();
  expect(await screen.findByText('Revisar Documentos')).toBeInTheDocument();
  expect(await screen.findByText('Nuevo Comunicado')).toBeInTheDocument();
});
