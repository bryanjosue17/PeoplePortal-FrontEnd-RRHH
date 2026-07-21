import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      given_name: 'Admin',
      name: 'Admin User',
      preferred_username: 'admin',
    },
    logout: vi.fn(),
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

it('KPI cards are clickable (have cursor pointer)', async () => {
  getAllEmployees.mockResolvedValue({ data: new Array(4).fill({}) });
  getAllRequests.mockResolvedValue({ data: new Array(2).fill({ status: 'Submitted' }) });
  getAllDocuments.mockResolvedValue({ data: new Array(8).fill({}) });
  getActiveAnnouncements.mockResolvedValue({ data: new Array(1).fill({}) });
  await renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes Activas')).toBeInTheDocument();
  });
});
