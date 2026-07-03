import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';

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

vi.mock('../api/employees', () => ({ getAllEmployees: vi.fn() }));
vi.mock('../api/hrRequests', () => ({ getAllRequests: vi.fn() }));
vi.mock('../api/hrDocuments', () => ({ getAllDocuments: vi.fn() }));
vi.mock('../api/announcements', () => ({ getActiveAnnouncements: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { getActiveAnnouncements } from '../api/announcements';
import { getAllEmployees } from '../api/employees';
import { getAllDocuments } from '../api/hrDocuments';
import { getAllRequests } from '../api/hrRequests';

async function renderDashboard() {
  const Dashboard = (await import('../pages/Dashboard/Dashboard')).default;
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}


it('renders summary cards after loading', async () => {
  getAllEmployees.mockResolvedValue({ data: new Array(10).fill({}) });
  getAllRequests.mockResolvedValue({ data: new Array(5).fill({ status: 'Submitted' }) });
  getAllDocuments.mockResolvedValue({ data: new Array(20).fill({}) });
  getActiveAnnouncements.mockResolvedValue({ data: new Array(3).fill({}) });
  await renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes Activas')).toBeInTheDocument();
    expect(screen.getByText('Documentos Activos')).toBeInTheDocument();
    expect(screen.getByText('Comunicados Recientes')).toBeInTheDocument();
  });
});

it('displays correct summary values', async () => {
  getAllEmployees.mockResolvedValue({ data: new Array(10).fill({}) });
  getAllRequests.mockResolvedValue({ data: new Array(5).fill({ status: 'Submitted' }) });
  getAllDocuments.mockResolvedValue({ data: new Array(20).fill({}) });
  getActiveAnnouncements.mockResolvedValue({ data: new Array(3).fill({}) });
  await renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

it('shows quick action buttons', async () => {
  getAllEmployees.mockResolvedValue({ data: [] });
  getAllRequests.mockResolvedValue({ data: [] });
  getAllDocuments.mockResolvedValue({ data: [] });
  getActiveAnnouncements.mockResolvedValue({ data: [] });
  await renderDashboard();
  expect(await screen.findByText('Gestionar Empleados')).toBeInTheDocument();
  expect(await screen.findByText('Revisar Documentos')).toBeInTheDocument();
  expect(await screen.findByText('Nuevo Comunicado')).toBeInTheDocument();
});
